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

    return res;
}

fn read_relarr<T>(
    cur: &mut Cursor<ByteArray>,
    func: impl Fn(&mut Cursor<ByteArray>) -> Result<T>,
) -> Result<Vec<T>> {
    // 8-byte header
    let offset = cur.read_i32::<LittleEndian>()?;
    let len = cur.read_i32::<LittleEndian>()?;

    if len == 0 {
        return Ok(vec![]);
    };

    let res = seek_and_read(cur, offset - 8, |c| {
        let mut res = vec![];
        for _ in 0..len {
            res.push(func(c)?);
        }
        return Ok::<Vec<T>>(res);
    })?;
    return Ok(res);
}

pub fn read_relstring(cur: &mut Cursor<ByteArray>) -> Result<String> {
    // 4-byte header
    let offset = cur.read_i32::<LittleEndian>()?;

    if offset - 4 + (cur.position() as i32) == -1 {
        return Ok(String::new());
    }

    let res = seek_and_read(cur, offset - 4, |c| {
        let mut res = String::new();
        while let StdResult::Ok(chr) = c.read_u8() {
            if chr == 0 {
                break;
            }

            res.push(chr as char);
        }

        return Ok::<String>(res);
    })?;

    return Ok(res);
}

pub fn read_relslice<T: POD>(cur: &mut Cursor<ByteArray>) -> Result<Vec<T>> {
    return read_relarr(cur, |c| T::new(c));
}

pub fn read_relstringarr(cur: &mut Cursor<ByteArray>) -> Result<Vec<String>> {
    return read_relarr(cur, |c: &mut Cursor<ByteArray>| read_relstring(c));
}

pub fn read_reli32arr(cur: &mut Cursor<ByteArray>) -> Result<Vec<i32>> {
    return read_relarr(cur, |c| Ok(c.read_i32::<LittleEndian>()?));
}
