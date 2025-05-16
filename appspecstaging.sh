echo -e  "version: 0.0\n
os: linux\n
files:\n
  - source: /dist/builds/staging_build/ \n
    destination: /var/www/clinic_mgmt_front_build/  \n
hooks:\n
  AfterInstall: \n
    - location: /after_install.sh \n
      timeout: 300 \n
      runas: root" >appspec.yml

  


  
  