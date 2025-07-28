use nextpnr_renderer::chipdb::{ecp5, ice40};
use std::{
    env,
    fs::File,
    io::{Read, Write},
    process::exit,
};

fn print_usage_and_exit() -> ! {
    eprintln!("Usage: chipdb_minimizer --arch <ice40|ecp5> --input <path> --output <path>");
    exit(1);
}

fn main() {
    let args: Vec<String> = env::args().collect();

    let mut arch = None;
    let mut input = None;
    let mut output = None;

    let mut i = 1;
    while i < args.len() {
        match args[i].as_str() {
            "--arch" => {
                i += 1;
                if i < args.len() {
                    arch = Some(args[i].clone());
                } else {
                    print_usage_and_exit();
                }
            }
            "--input" => {
                i += 1;
                if i < args.len() {
                    input = Some(args[i].clone());
                } else {
                    print_usage_and_exit();
                }
            }
            "--output" => {
                i += 1;
                if i < args.len() {
                    output = Some(args[i].clone());
                } else {
                    print_usage_and_exit();
                }
            }
            _ => {
                print_usage_and_exit();
            }
        }
        i += 1;
    }

    let arch = arch.unwrap_or_else(|| {
        eprintln!("Missing --arch argument");
        print_usage_and_exit();
    });

    let input = input.unwrap_or_else(|| {
        eprintln!("Missing --input argument");
        print_usage_and_exit();
    });

    let output = output.unwrap_or_else(|| {
        eprintln!("Missing --output argument");
        print_usage_and_exit();
    });

    let mut src_file = File::open(&input).unwrap_or_else(|err| {
        eprintln!("Failed to open input file {}: {}", input, err);
        exit(1);
    });

    let mut buf = vec![];
    src_file.read_to_end(&mut buf).unwrap_or_else(|err| {
        eprintln!("Failed to read input file: {}", err);
        exit(1);
    });

    let min_buf = match arch.as_str() {
        "ecp5" => {
            let chipinfo = ecp5::get_full_chipinfo(&buf).unwrap_or_else(|err| {
                eprintln!("Failed to parse ECP5 chipdb: {}", err);
                exit(1);
            });
            let min: ecp5::MinimizedChipInfoPOD = chipinfo.into();
            min.encode().unwrap()
        }
        "ice40" => {
            let chipinfo = ice40::get_full_chipinfo(&buf).unwrap_or_else(|err| {
                eprintln!("Failed to parse iCE40 chipdb: {}", err);
                exit(1);
            });
            let min: ice40::MinimizedChipInfoPOD = chipinfo.into();
            min.encode().unwrap()
        }
        _ => {
            eprintln!("Unsupported architecture: {}", arch);
            print_usage_and_exit();
        }
    };

    let mut dst_file = File::create(&output).unwrap_or_else(|err| {
        eprintln!("Failed to create output file {}: {}", output, err);
        exit(1);
    });

    dst_file.write_all(&min_buf).unwrap_or_else(|err| {
        eprintln!("Failed to write to output file: {}", err);
        exit(1);
    });

    println!("Minimized chipdb written to {}", output);
}
