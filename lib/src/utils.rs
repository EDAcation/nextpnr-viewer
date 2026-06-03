mod js {
    use wasm_bindgen::prelude::*;

    #[wasm_bindgen]
    extern "C" {
        #[wasm_bindgen(js_namespace = console)]
        pub fn log(msg: &str);
    }
}

pub fn set_panic_hook() {
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();
}

#[allow(dead_code)]
pub fn log(msg: String) {
    js::log(&msg[..])
}

#[allow(dead_code, unused_variables)]
pub fn debug_log(msg: String) {
    #[cfg(feature = "debug_log")]
    log(msg);
}
