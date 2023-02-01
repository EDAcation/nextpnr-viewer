# Development

## Setup
```shell
git clone git@github.com:EDAcation/nextpnr-viewer.git
cd nextpnr-viewer
npm install
```

## Building
```shell
npm exec -w parcel-optimizer-array-buffer parcel build
npm run -w lib build
```

## Publishing
```shell
cd lib
npm publish
```
