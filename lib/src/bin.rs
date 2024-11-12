use std::fs;

use nextpnr_renderer;

pub fn main() {
    let file = fs::read("/home/mike/EDAcation/nextpnr-viewer/lib/static/chipdb/ecp5/85k.bin");
    assert!(file.is_ok(), "Could not read file");

    for _ in 0..10 {
        coz::begin!("graphic_elements");
        let result = nextpnr_renderer::do_something(&file.as_ref().unwrap()[..]);
        coz::end!("graphic_elements");
        assert!(result.is_ok());
    }
}
