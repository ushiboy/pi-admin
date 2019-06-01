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
def setup(c):
    c.sudo('mkdir -p /extra/app')
    c.sudo('sh -c "chown \$SUDO_USER.\$SUDO_USER /extra/app"')
    c.sudo('sh -c "ln -s /extra/app /home/\$SUDO_USER/app"')
    patchwork.transfers.rsync(c, './build/*', '/extra/app')
    c.put('./bin/setup.sh', '/tmp/setup.sh')
    c.sudo('/tmp/setup.sh')
