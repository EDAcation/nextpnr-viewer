mod nextpnr;
mod nextpnr_types;
mod report;
mod report_types;

use anyhow::Result;
pub use nextpnr_types::{INextpnrJSON, NextpnrJson};

pub use report_types::{IReportJSON, ReportJson};

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
}
