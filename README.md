# Veracode PFix  Action



## About



## Usage

* Required
  * vid
    * the Veracode API ID
  * vkey
    * the Veracode API Secret Key
  * inputFile
    * The results file from a Veracode pipeline scan. Please make sure pipeline scan is run wiht `--esd true`
  * language:
    The language the source code is written in. (will go away at some point in time)
  
* Optional
  * cwe
    * A single CWE or a comma separated list of CWEs to filter on nad generate fix suggestions for
  * source_base_path_1
    * Rewrite path 1, in some cases the source file is on a different path than the one in the scan results
  * source_base_path_2
    * Rwrite path 2, in some cases the source file is on a different path than the one in the scan results
  * source_base_path_3
    * Rewrite path 3, in some cases the source file is on a different path than the one in the scan results
  * debug:
    * Enable debug mode - very verbose!
  * language:
    The language the source code is written in.
  * prComment
    * Create comments for fixes on PRs if the action runs on a PR

## Examples  
All examples follow the same strucutre, the will all `need` the `build` to be finished before the they will start running. Veraocde's static analysis is mainly binary static analysis, therefore a compile/build action is required before a pipeline scan can be started. Please read about the packaging and compilation requirements here: https://docs.veracode.com/r/compilation_packaging.  
The examples will checkout the repository, they will download the previously generated build artefact, that is named `verademo.war` and then run the action.  
  

The basic yml  
  
  ```yml 
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-java@v3
      with:
        distribution: 'zulu'
        java-version: 8
    - name: Cache Maven packages
      uses: actions/cache@v3
      with:
        path: ~/.m2
        key: ${{ runner.os }}-m2-${{ hashFiles('**/pom.xml') }}
    - name: Build with Maven
      run: mvn clean package

    - uses: actions/upload-artifact@v3
      with:
        name: verademo.war
        path: target/verademo.war
        
  pipeline_scan:
      needs: build
      runs-on: ubuntu-latest
      name: pipeline scan
      steps:
        - name: checkout repo
          uses: actions/checkout@v3

        - name: get archive
          uses: actions/download-artifact@v3
          with:
            name: verademo.war
        - name: pipeline-scan action step
          id: pipelien-scan
          uses: veracode/Veracode-pipeline-scan-action@v1.0.12
          with:
            vid: ${{ secrets.VID }}
            vkey: ${{ secrets.VKEY }}
            file: "verademo.war" 
            request_policy: "VeraDemo Policy"
            debug: 1
            fail_build: false

  veracode-fix:
    runs-on: ubuntu-latest
    needs: pipeline_scan
    name: create fixes
    steps:
      - name: checkout repo
        uses: actions/checkout@v3

      - name: get flaw file
        uses: actions/download-artifact@v3
        with:
          name: Veracode Pipeline-Scan Results
          
      - name: Create fixes from static findings
        id: convert
        uses: Veracode/veracode-fix@main
        with:
          inputFile: filtered_results.json
          vid: ${{ secrets.VID }}
          vkey: ${{ secrets.VKEY }}
          source_base_path_1: "com/:src/main/java/com/"
          source_base_path_2: "WEB-INF:src/main/webapp/WEB-INF"
          language: java
          cwe: '89,117'
          debug: true
          prComment: true
  ``` 


## Compile the action  
The action comes pre-compiled as transpiled JavaScript. If you want to fork and build it on your own you need NPM to be installed, use `ncc` to compile all node modules into a single file, so they don't need to be installed on every action run. The command to build is simply  

```sh
ncc build ./src/index.ts  
```


http --auth-type=veracode_hmac -vv -f POST "https://api.veracode.com/fix/v1/project/upload_code" \                    
data@data.tar.gz \
name="data"

http --auth-type=veracode_hmac -vv -j GET "https://api.veracode.com/fix/v1/project/PROJECTID/results"

tar -czf data.tar.gz flawInfo UserController.java  