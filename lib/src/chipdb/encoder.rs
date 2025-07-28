use anyhow::{bail, Result};
use bincode::config::{self, Configuration};
use miniz_oxide::{deflate, inflate};
use serde::{de::DeserializeOwned, Serialize};

const BINCODE_CFG: Configuration = config::standard().with_variable_int_encoding();
const COMPRESSION_LEVEL: u8 = 1;

pub fn decode_min_chipinfo<T: DeserializeOwned>(chipdata: &[u8]) -> Result<T> {
    let decompressed = match inflate::decompress_to_vec(chipdata) {
        Ok(res) => res,
        Err(_) => bail!("Failed to decompress chipdb"),
    };
    Ok(bincode::serde::decode_from_slice(&decompressed, BINCODE_CFG)?.0)
}

pub fn encode_min_chipinfo<T: Serialize>(chip_info: T) -> Result<Vec<u8>> {
    let encoded = bincode::serde::encode_to_vec(chip_info, BINCODE_CFG)?;
    Ok(deflate::compress_to_vec(&encoded, COMPRESSION_LEVEL))
}
