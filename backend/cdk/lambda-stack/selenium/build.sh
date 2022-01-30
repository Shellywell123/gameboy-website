#!/bin/zsh

# clean
rm -rf deploy
rm -rf layer
rm -rf __pycache__


# build
rm -f layer.zip
mkdir layer layer/python
cp -r bin layer/.
unzip -u chromium.zip -d layer/bin
pip3 install -r requirements.txt -t layer/python
pushd layer; zip -9qr layer.zip .; popd
pwd
cp layer/layer.zip .
rm -rf layer
