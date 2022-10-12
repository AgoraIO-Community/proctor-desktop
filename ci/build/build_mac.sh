# --------------------------------------------------------------------------------------------------------------------------
# =====================================
# ========== Guidelines ===============
# =====================================
#
# -------------------------------------
# ---- Common Environment Variable ----
# -------------------------------------
# ${Package_Publish} (boolean): Indicates whether it is build package process, e.g. If you want to get one CI SDK package.
# ${Clean_Clone} (boolean): Indicates whether it is clean build. If true, CI will clean ${output} for each build process.
# ${is_tag_fetch} (boolean): If true, git checkout will work as tag fetch mode.
# ${is_official_build} (boolean): Indicates whether it is official build release.
# ${arch} (string): Indicates build arch set in build pipeline.
# ${short_version} (string): CI auto generated short version string.
# ${release_version} (string): CI auto generated version string.
# ${build_date} (string(yyyyMMdd)): Build date generated by CI.
# ${build_timestamp} (string (yyyyMMdd_hhmm)): Build timestamp generated by CI.
# ${platform} (string): Build platform generated by CI.
# ${BUILD_NUMBER} (string): Build number generated by CI.
# ${WORKSPACE} (string): Working dir generated by CI.
#
# -------------------------------------
# ------- Job Custom Parameters -------
# -------------------------------------
# If you added one custom parameter via rehoboam website, e.g. extra_args.
# You could use $extra_args to get its value.
#
# -------------------------------------
# ------------- Input -----------------
# -------------------------------------
# ${source_root}: Source root which checkout the source code.
# ${WORKSPACE}: project owned private workspace.
#
# -------------------------------------
# ------------- Output ----------------
# -------------------------------------
# Generally, we should put the output files into ${WORKSPACE}
# 1. for pull request: Output files should be zipped to test.zip, and then copy to ${WORKSPACE}.
# 2. for pull request (options): Output static xml should be static_${platform}.xml, and then copy to ${WORKSPACE}.
# 3. for others: Output files should be zipped to anything_you_want.zip, and then copy it to {WORKSPACE}.
#
# -------------------------------------
# --------- Avaliable Tools -----------
# -------------------------------------
# Compressing & Decompressing: 7za a, 7za x
#
# -------------------------------------
# ----------- Test Related ------------
# -------------------------------------
# PR build, zip test related to test.zip
# Package build, zip package related to package.zip
#
# -------------------------------------
# ------ Publish to artifactory -------
# -------------------------------------
# [Download] artifacts from artifactory:
# python3 ${WORKSPACE}/artifactory_utils.py --action=download_file --file=ARTIFACTORY_URL
#
# [Upload] artifacts to artifactory:
# python3 ${WORKSPACE}/artifactory_utils.py --action=upload_file --file=FILEPATTERN --project
# Sample Code:
# python3 ${WORKSPACE}/artifactory_utils.py --action=upload_file --file=*.zip --project
#
# [Upload] artifacts folder to artifactory
# python3 ${WORKSPACE}/artifactory_utils.py --action=upload_file --file=FILEPATTERN --project --with_folder
# Sample Code:
# python3 ${WORKSPACE}/artifactory_utils.py --action=upload_file --file=./folder --project --with_folder
#
# ========== Guidelines End=============
# --------------------------------------------------------------------------------------------------------------------------

echo Package_Publish: $Package_Publish
echo is_tag_fetch: $is_tag_fetch
echo arch: $arch
echo source_root: %source_root%
echo output: /tmp/jenkins/${project}_out
echo build_date: $build_date
echo build_time: $build_time
echo release_version: $release_version
echo short_version: $short_version
echo pwd: `pwd`


echo "-----install------"
sh ./scripts/install-apaas-modules.sh
echo "-----install finished------"



if ["$record" = ""]
    then
        if [ "$Env" = "Prod" ] 
            then
                REACT_APP_AGORA_APP_SDK_DOMAIN=http://api-solutions-dev.bj2.agoralab.co
                REACT_APP_AGORA_APP_TOKEN_DOMAIN=http://api-solutions-dev.bj2.agoralab.co   
                export PROCTORING_DEMO_PUBLISH_PATH=proctoring/test
            else 
                REACT_APP_AGORA_APP_SDK_DOMAIN=http://api-solutions-dev.bj2.agoralab.co
                REACT_APP_AGORA_APP_TOKEN_DOMAIN=http://api-solutions-dev.bj2.agoralab.co   
                export PROCTORING_DEMO_PUBLISH_PATH=proctoring/test
                # echo REACT_APP_AGORA_APP_SDK_DOMAIN:$REACT_APP_AGORA_APP_SDK_DOMAIN
                # echo REACT_APP_AGORA_APP_TOKEN_DOMAIN:$REACT_APP_AGORA_APP_TOKEN_DOMAIN
                # echo PROCTORING_DEMO_PUBLISH_PATH:$PROCTORING_DEMO_PUBLISH_PATH
                echo "-----build------"
                yarn ci:build:web
                echo "-----build finished------"
                echo "-----publish started------"
                aws s3 sync ./packages/agora-proctor-demo/build/. s3://agora-adc-artifacts/$PROCTORING_DEMO_PUBLISH_PATH/ --cache-control no-cache
                global_url=https://solutions-apaas.agora.io/$PROCTORING_DEMO_PUBLISH_PATH/index.html
                echo global_url: $global_url
                echo "-----publish success------"
            fi
                
    else 
            
            echo "-----build------"
            yarn release:proctor:sdk
            echo "-----build finished------"
            mkdir -p record_temp
            cp templates/record_page_test.html ./record_temp/record_page_test.html || true
            url=https://agora-adc-artifacts.s3.cn-north-1.amazonaws.com.cn/apaas/proctor/record/test/$record/record_page_test.html
            echo $url
            aws s3 sync ./record_temp/. s3://agora-adc-artifacts/apaas/proctor/record/test/$record
    fi
    






