mod nextpnr;
mod nextpnr_types;
mod report;
mod report_types;

use anyhow::Result;
pub use nextpnr_types::{INextpnrJSON, NextpnrJson};

pub use report_types::{IReportJSON, ReportJson};

use crate::pnrjson::nextpnr::{NextpnrElements, RoutingPart};

pub enum Chip {
    ICE40,
    ECP5,
}

pub struct PnrInfo {
    chip: Chip,
    nextpnr_json: NextpnrJson,
    report_json: Option<ReportJson>,
}

impl PnrInfo {
    pub fn from_jsobj(
        chip: Chip,
        nextpnr: INextpnrJSON,
        report: Option<IReportJSON>,
    ) -> Result<Self> {
        Ok(Self {
            chip,
            nextpnr_json: NextpnrJson::from_jsobj(nextpnr)?,
            report_json: report.map(ReportJson::from_jsobj).transpose()?,
        })
    }

    pub fn get_elements(&'_ self) -> NextpnrElements<'_> {
        return self.nextpnr_json.get_elements(&self.chip);
    }

    pub fn get_critical_netnames(&self) -> Vec<RoutingPart> {
        let Some(report) = &self.report_json else {
            return vec![];
        };

        return report
            .get_critical_netnames()
            .iter()
            .filter_map(|&n| self.nextpnr_json.get_netname(n))
            .flat_map(|n| n.get_routing(&self.chip))
            .collect();
    }
}
