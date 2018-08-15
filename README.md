# kradan

> The tool for helping you to broadcast your code in your class room.

<img src="https://rawgit.com/thangman22/kradan/master/icon.png" height="200">

## What is kradan

Kradan is a tool for helping you to public your live code with your class or training session. It's not easy to write down a code and let's everyone in the room understand or copy your code. Kradan will watch and list your file on current directory and publish to web ui. You will able to switch to another screen but your following still able to inspect the code and copy to there project.

## usage

``` bash
sudo npm install -g kradan
kradan

or

kradan --dir /path/to/

```
![logo](https://rawgit.com/devilmustcry/kradan/master/usage-tutorial.gif)

## options

``` bash
-h, --help      Display help messages
-v, --version   Display current kradan version
-u, --public    Genrate public URL by ngrok
-p, --port      Specify port number
-d, --dir       Working Dir
```

## Build Setup

``` bash
# install dependencies
npm install

# run unit tests
npm run build
```

## Development

``` bash
npm run dev
```
