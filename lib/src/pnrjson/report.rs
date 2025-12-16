use anyhow::{Error, Result};

use crate::pnrjson::{IReportJSON, ReportJson};

impl ReportJson {
    pub fn from_jsobj(val: IReportJSON) -> Result<Self> {
        match serde_wasm_bindgen::from_value(val.into()) {
            Ok(r) => anyhow::Ok(r),
            Err(e) => Err(Error::msg(e.to_string())),
        }
    }

    pub fn get_critical_netnames(&self) -> Vec<&String> {
        self.critical_paths
            .iter()
            .flat_map(|s| s.path.iter().filter_map(|s| s.net.as_ref()))
            .collect()
    }
}
