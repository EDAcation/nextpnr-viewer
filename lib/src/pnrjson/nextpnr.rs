use anyhow::{Error, Result};

use crate::architecture::{Wire, WireLocation};
use crate::pnrjson::nextpnr_types::Netname;
use crate::pnrjson::{Chip, INextpnrJSON, NextpnrJson};

pub struct NextpnrBel<'a> {
    pub nextpnr_bel: &'a String,
    pub cell_type: &'a Option<String>,
}

#[allow(dead_code)]
pub struct NextpnrElements<'a> {
    pub wires: Vec<String>,
    pub groups: Vec<String>,
    pub bels: Vec<NextpnrBel<'a>>,
    pub pips: Vec<PipFromTo>,
}

pub struct RoutingPart {
    pub wire_id: String,
    pub pip: PipFromTo,
}

#[derive(Clone)]
#[allow(dead_code)]
pub struct PipFromTo {
    pub location: WireLocation,
    pub from: Wire,
    pub to: Wire,
    pub name: String,
}

fn parse_wire(s: String, delimiter: &str) -> Option<Wire> {
    let parts: Vec<_> = s.splitn(3, delimiter).collect();
    Some(Wire {
        location: WireLocation {
            x: parts.first()?.parse().ok()?,
            y: parts.get(1)?.parse().ok()?,
        },
        name: parts.get(2)?.to_string(),
    })
}

fn parse_pip_from_to(s: String, chip: &Chip) -> Option<PipFromTo> {
    let parts: Vec<_> = s.splitn(3, '/').collect();
    let x = match parts.first()? {
        &"" => return None,
        x_str => x_str[1..].parse().ok()?,
    };
    let y = match parts.get(1)? {
        &"" => return None,
        y_str => y_str[1..].parse().ok()?,
    };

    let (pip_delim, wire_delim) = match chip {
        Chip::ICE40 => (".->.", "."),
        Chip::ECP5 => ("->", "_"),
    };

    let pip_parts: Vec<_> = parts.get(2)?.splitn(2, pip_delim).collect();
    let pip_from = parse_wire(pip_parts.first()?.to_string(), wire_delim)?;
    let pip_to = parse_wire(pip_parts.get(1)?.to_string(), wire_delim)?;

    Some(PipFromTo {
        location: WireLocation { x, y },
        from: pip_from,
        to: pip_to,
        name: s,
    })
}

impl Netname {
    pub fn get_routing(&self, chip: &Chip) -> Vec<RoutingPart> {
        let parts: Vec<&str> = self.attributes.ROUTING.split(';').collect();
        parts
            .chunks(3)
            .filter_map(|c| {
                Some(RoutingPart {
                    wire_id: c.first()?.to_string(),
                    pip: parse_pip_from_to(c.get(1)?.to_string(), chip)?,
                })
            })
            .collect()
    }
}

impl NextpnrJson {
    pub fn from_jsobj(val: INextpnrJSON) -> Result<Self> {
        match serde_wasm_bindgen::from_value(val.into()) {
            Ok(r) => anyhow::Ok(r),
            Err(e) => Err(Error::msg(e.to_string())),
        }
    }

    pub fn get_netname(&self, name: &String) -> Option<&Netname> {
        self.modules.top.netnames.get(name)
    }

    pub fn get_elements(&self, chip: &Chip) -> NextpnrElements<'_> {
        let bels = self.get_bels();
        let all_routings = self.get_all_routings(chip);

        NextpnrElements {
            wires: all_routings.iter().map(|r| r.wire_id.clone()).collect(),
            groups: vec![],
            bels,
            pips: all_routings.iter().map(|r| r.pip.clone()).collect(),
        }
    }

    fn get_all_routings(&self, chip: &Chip) -> Vec<RoutingPart> {
        self.modules
            .top
            .netnames
            .values()
            .flat_map(|nn| nn.get_routing(chip))
            .collect()
    }

    fn get_bels(&self) -> Vec<NextpnrBel<'_>> {
        self.modules
            .top
            .cells
            .values()
            .map(|cell| NextpnrBel {
                nextpnr_bel: &cell.attributes.NEXTPNR_BEL,
                cell_type: &cell.attributes.cellType,
            })
            .collect()
    }
}
