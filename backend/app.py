import os
import subprocess
import tornado.ioloop
import tornado.web

class SystemControl(object):

    def poweroff(self):
        subprocess.run(["sudo", "shutdown", "-h", "now"])

class SystemControlMock(object):

    def poweroff(self):
        print(["sudo", "shutdown", "-h", "now"])


class PowerOffHandler(tornado.web.RequestHandler):

    def initialize(self, sys_ctrl):
        self._sys_ctrl = sys_ctrl

    def post(self):
        self._sys_ctrl.poweroff()
        self.set_status(200)

def make_app(sys_ctrl):
    return tornado.web.Application([
        (r"/api/poweroff", PowerOffHandler, {"sys_ctrl": sys_ctrl}),
        (r"/(.*)", tornado.web.StaticFileHandler, {
            "path": "./htdocs",
            "default_filename":"index.html"
         })
    ])

if __name__ == '__main__':
    try:
        dry_run = os.getenv('DRY_RUN', False)
        port = int(os.getenv('PORT', "8080"))
        if dry_run:
            sys_ctrl = SystemControlMock()
        else:
            sys_ctrl = SystemControl()
        app = make_app(sys_ctrl)
        app.listen(port, "127.0.0.1")
        tornado.ioloop.IOLoop.instance().start()
    except KeyboardInterrupt:
        pass
