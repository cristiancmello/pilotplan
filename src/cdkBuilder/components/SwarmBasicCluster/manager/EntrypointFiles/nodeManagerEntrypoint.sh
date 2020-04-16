#!/bin/sh

insertSwarmLeaveClusterScript() {
  sudo sh -c "cat << EOF >> /etc/rc.d/rc0.d/01SWARMleave
  #!/bin/sh

  docker swarm leave --force
  EOF"

  sudo chmod +x /etc/rc.d/rc0.d/01SWARMleave

  sudo ln -s /etc/rc.d/rc0.d/01SWARMleave /etc/rc.d/rc6.d/01SWARMleave
}

insertSwarmLeaveClusterScript

sudo docker swarm init --advertise-addr eth0