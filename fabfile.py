from invoke import task
import os
import patchwork.transfers

@task
def build_frontend(c):
    with c.cd('./frontend'):
        c.run('npm install', env=os.environ)
        c.run('npm run build', env=os.environ)

@task
def build(c):
    build_frontend(c)
    c.run('rm -rf tmp build')
    c.run('git clone . tmp')
    c.run('cp -r frontend/build tmp/backend/htdocs')
    c.run('mkdir build')
    c.run('mv tmp/backend/* build')

@task
def deploy(c):
    patchwork.transfers.rsync(c, './build/*', '/home/pi/app')
    with c.cd('/home/pi/app'):
        c.run('python3 -m venv venv')
        c.run('venv/bin/pip install --upgrade pip')
        c.run('venv/bin/pip install -r requirements.txt')
