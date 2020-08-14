# Build

Run `make $colour` to create a container labelled with that colour that shows a header in that colour.

Note that the foreground colour is white, so light container names are likely a bad idea

# Run

`docker run -e ROOT_CONTEXT=/docker-debug -p 7070:7070 willthames/docker-debug`

will create a docker-debug service responding to http://localhost:7070/docker-debug

The `ROOT_CONTEXT` is optional, if omitted it will respond to http://localhost:7070/

# Acknowledgments

Thanks to https://github.com/South-Paw/koa-typescript for saving me a lot of the initial
work of setting up koa for typescript and jest
