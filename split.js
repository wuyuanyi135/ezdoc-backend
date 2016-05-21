var src = `PMID- 18279234
OWN - NLM
STAT- MEDLINE
DA  - 20080218
DCOM- 20080508
IS  - 0022-1198 (Print)
IS  - 0022-1198 (Linking)
VI  - 53
IP  - 1
DP  - 2008 Jan
TI  - Demographic change and forensic identification: problems in metric identification
      of Hispanic skeletons.
PG  - 21-8
LID - 10.1111/j.1556-4029.2007.00614.x [doi]
AB  - The United States (U.S.) population structure is currently in a state of flux
      with one of the most profound changes being the increasing number of people
      referred to as Hispanic. In the U.S., much of the identification criteria for a
      biological profile are based on American Black and White individuals from
      anatomical collections. Using metric data from the Forensic Anthropology Data
      Bank (FDB), this paper will attempt to explore several issues that forensic
      anthropologists face when confronted with Hispanic remains. These will involve
      estimation of sex, height, and ancestry, the initial components of a biological
      profile. Discriminant function analyses indicate that American White criteria
      provide poor estimations of sex when applied to Hispanics and that ancestry
      estimation of Hispanic crania is difficult. Additionally, a new linear regression
      equation is presented that estimates stature for Hispanic individuals, although
      population specific criteria are still needed for Hispanic individuals from
      diverse geographical origins.
FAU - Spradley, M Katherine
AU  - Spradley MK
AD  - Department of Anthropology, The University of Tennessee, 250 South Stadium Hall,
      Knoxville, TN 37996, USA. mspradley@uwf.edu
FAU - Jantz, Richard L
AU  - Jantz RL
FAU - Robinson, Alan
AU  - Robinson A
FAU - Peccerelli, Fredy
AU  - Peccerelli F
LA  - eng
PT  - Journal Article
PT  - Research Support, Non-U.S. Gov't
PL  - United States
TA  - J Forensic Sci
JT  - Journal of forensic sciences
JID - 0375370
SB  - IM
MH  - Body Height
MH  - Discriminant Analysis
MH  - Female
MH  - Forensic Anthropology/*methods
MH  - *Hispanic Americans
MH  - Humans
MH  - Latin America/ethnology
MH  - Male
MH  - Reference Values
MH  - Sex Characteristics
MH  - Sex Determination by Skeleton/*methods
EDAT- 2008/02/19 09:00
MHDA- 2008/05/09 09:00
CRDT- 2008/02/19 09:00
AID - JFO614 [pii]
AID - 10.1111/j.1556-4029.2007.00614.x [doi]
PST - ppublish
SO  - J Forensic Sci. 2008 Jan;53(1):21-8. doi: 10.1111/j.1556-4029.2007.00614.x.`;
var _ = require('lodash');
var reg = /^(.*?)\s*\-\s*(((?!\n[A-Z])[\S\s])*)/gm;
var obj = {};

var tmp;
while (tmp = reg.exec(src)) {
    var tmpObj = {};
    tmp[2] = tmp[2].replace(/\s+/gm,' ');
    if (tmp[1] in obj) {
        var tmpArray = _.castArray(obj[tmp[1]]);
        tmpArray.push(tmp[2]);
        tmpObj[tmp[1]] = tmpArray;
    } else {
        tmpObj[tmp[1]] = tmp[2];
    }
    obj = _.merge({},obj,tmpObj);
}

console.log(obj);
