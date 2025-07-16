use std::io::{Cursor, Result as StdResult, Seek};

use anyhow::{Ok, Result};
use byteorder::{LittleEndian, ReadBytesExt};

pub type ByteArray<'a> = &'a [u8];

pub trait POD {
    fn new(cur: &mut Cursor<ByteArray>) -> Result<Self>
    where
        Self: Sized;
}

fn seek_and_read<T>(
    cur: &mut Cursor<ByteArray>,
    relpos: i32,
    func: impl Fn(&mut Cursor<ByteArray>) -> Result<T>,
) -> Result<T> {
    // Seek to pos
    let old_pos = cur.position();

    cur.seek_relative(relpos as i64)?;

    let res = func(cur);

    // Seek back to original position
    cur.set_position(old_pos);

    res
}

fn read_relarr<T>(
    cur: &mut Cursor<ByteArray>,
    func: impl Fn(&mut Cursor<ByteArray>) -> Result<T>,
) -> Result<Vec<T>> {
    // 8-byte header
    let offset = cur.read_i32::<LittleEndian>()?;
    let len = cur.read_u32::<LittleEndian>()?;

    if len == 0 {
        return Ok(vec![]);
    };

    let res = seek_and_read(cur, offset - 8, |c| {
        let mut res = Vec::with_capacity(len.try_into().unwrap());
        for _ in 0..len {
            res.push(func(c)?);
        }
        Ok::<Vec<T>>(res)
    })?;
    Ok(res)
}

pub fn read_relstring(cur: &mut Cursor<ByteArray>) -> Result<String> {
    // 4-byte header
    let offset = cur.read_i32::<LittleEndian>()?;

    if offset - 4 + (cur.position() as i32) == -1 {
        return Ok(String::new());
    }

    seek_and_read(cur, offset - 4, |c| {
        let mut res = String::new();
        while let StdResult::Ok(chr) = c.read_u8() {
            if chr == 0 {
                break;
            }

            res.push(chr as char);
        }

        Ok::<String>(res)
    })
}

pub fn read_relptr<T: POD>(cur: &mut Cursor<ByteArray>) -> Result<T> {
    // 4-byte header
    let offset = cur.read_i32::<LittleEndian>()?;

    seek_and_read(cur, offset - 4, |c| T::new(c))
}

pub fn read_relslice<T: POD>(cur: &mut Cursor<ByteArray>) -> Result<Vec<T>> {
    read_relarr(cur, |c| T::new(c))
}

pub fn read_relstringarr(cur: &mut Cursor<ByteArray>) -> Result<Vec<String>> {
    read_relarr(cur, |c: &mut Cursor<ByteArray>| read_relstring(c))
}

pub fn read_reli32arr(cur: &mut Cursor<ByteArray>) -> Result<Vec<i32>> {
    read_relarr(cur, |c| Ok(c.read_i32::<LittleEndian>()?))
}

pub fn read_relu32arr(cur: &mut Cursor<ByteArray>) -> Result<Vec<u32>> {
    read_relarr(cur, |c| Ok(c.read_u32::<LittleEndian>()?))
}
