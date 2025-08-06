# Development

## Setup

```shell
git clone git@github.com:EDAcation/nextpnr-viewer.git
cd nextpnr-viewer
npm install
```

## Building

```shell
npm run -w lib build
```

## Publishing

```shell
cd lib
npm -w lib publish
```

## Obtaining chip databases

1. Clone and compile [nextpnr](https://github.com/YosysHQ/nextpnr) according to the instructions. You can skip the actual installation part (`make install`).
2. Navigate to the build directory containing chipdbs (example: `./build/ice40` relative to nextpnr root)
3. The chipdb-*.cc files in this directory contain C arrays with the data that we need

The data can be extracted in several ways, but one of them is as follows:
1. Modify each chipdb file and only keep the array definition + contents (`const uint8_t chipdb_blob_xxx[1234] = ...`)
2. Write a program to write said array to a file, example:
```cpp
#include <fstream>
#include <cstdint>

#include "chipdb-u4k.bin.cc"

int main() {
    std::ofstream out("chipdb-u4k.bin", std::ios::binary);
    out.write(reinterpret_cast<const char*>(chipdb_blob_u4k), sizeof(chipdb_blob_u4k));
    return 0;
}
```
3. Run the program to get the binary chipdb file. Put it under `lib/static/chipdb/<arch>/` and commit it to this repository.
