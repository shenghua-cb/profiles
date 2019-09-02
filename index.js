const csvFs = require('csvtojson');
const fastcsv = require('fast-csv');
const fs = require('fs');
const _ = require('lodash')

main();

async function main() {
  const applications = await csvFs().fromFile("./applicationInfo.csv");
  const aUserProfiles = await csvFs().fromFile("./aUserprofile.csv");

  const profiles = [];
  emailGroupedApplications = _.groupBy(applications, (e) => {
    return e.ApplicantEmail.toLowerCase()
  });
  const emails = Object.keys(emailGroupedApplications);
  emails.forEach(email => {
    if (!email || email === 'NULL') return;

    const profile = {};
    const applications = emailGroupedApplications[email];
    applications.forEach(app => {
      const aUserProfile = aUserProfiles.find(p => p.ResumeDID == app.AnonymousResumeDID);
      setProfileByTwoFiles(profile, app, aUserProfile);
    });

    profiles.push(profile);
  });

  // applications.forEach(app => {
  //   const aUserProfile = aUserProfiles.find(p => p.ResumeDID == app.AnonymousResumeDID);
  //   const profile = getProfileByTwoFiles(app, aUserProfile);
  //   profiles.push(profile);
  // });

  writeToCsvFile(profiles);
}

function setProfileByTwoFiles(profile = {}, application = {}, aUserProfile = {}) {
  profile.tndid = profile.tndid || application.TNDID;
  profile.join_path = 'CS';
  profile.preferred_language = 'RMEnglish';
  profile.first_name = profile.first_name || application.ApplicantFirstName;
  profile.last_name = profile.last_name || application.ApplicantLastName;
  profile.country_code = profile.country_code || application.ApplicantCountryName;
  profile.desired_job_title = profile.desired_job_title || application.JobTitle;
  profile.email_address = profile.email_address || application.ApplicantEmail;
  profile.zip_code = profile.zip_code || aUserProfile.GeoUSZip5;
  profile.postal_code = profile.postal_code || aUserProfile.GeoUSZip5;
  profile.iso_language = 'en-us';

  profile.phone_custom_questions_JQKF32Z7099N3LKTJD9G = profile.phone_custom_questions_JQKF32Z7099N3LKTJD9G || aUserProfile.Phone; // phone
  profile.pay_custom_questions_JQKF2WB5Y35V5FQYZ94V = ''; // Desired Pay Rate
  profile.pay_type_custom_questions_JQKF86G6P1P82CNXRZ23 = ''; // pay type
  profile.education_custom_questions_JQKD6V15WTLSZY4QQGYH = ''; // Highest Level of Education
  profile.security_clearance_custom_questions_JQKD16V6K52H54B025P1 = ''; // Do you have security clearance?
  profile.work_status_custom_questions_JQKF6X76LTJ2SBCM169W = profile.work_status_custom_questions_JQKF6X76LTJ2SBCM169W || aUserProfile.WorkStatus; // Work Status
  profile.linkedIn_custom_questions_JQKD7MS6QXPST6HP4QY5 = ''; // Add a link to your LinkedIn profile

  profile.resume_word_doc = '';
  profile.resume_filename = '';
  profile.resume_origin = ''
}

function getProfileByTwoFiles(application = {}, aUserProfile = {}) {
  const profile = {};

  profile.tndid = application.TNDID;
  profile.join_path = 'CS';
  profile.preferred_language = 'RMEnglish';
  profile.first_name = application.ApplicantFirstName;
  profile.last_name = application.ApplicantLastName;
  profile.country_code = application.ApplicantCountryName;
  profile.desired_job_title = application.JobTitle;
  profile.email_address = application.ApplicantEmail;
  profile.zip_code = aUserProfile.GeoUSZip5;
  profile.postal_code = aUserProfile.GeoUSZip5;
  profile.iso_language = 'en-us';

  profile.phone_custom_questions_JQKF32Z7099N3LKTJD9G = aUserProfile.Phone; // phone
  profile.pay_custom_questions_JQKF2WB5Y35V5FQYZ94V = ''; // Desired Pay Rate
  profile.pay_type_custom_questions_JQKF86G6P1P82CNXRZ23 = ''; // pay type
  profile.education_custom_questions_JQKD6V15WTLSZY4QQGYH = ''; // Highest Level of Education
  profile.security_clearance_custom_questions_JQKD16V6K52H54B025P1 = ''; // Do you have security clearance?
  profile.work_status_custom_questions_JQKF6X76LTJ2SBCM169W = aUserProfile.WorkStatus; // Work Status
  profile.linkedIn_custom_questions_JQKD7MS6QXPST6HP4QY5 = ''; // Add a link to your LinkedIn profile

  profile.resume_word_doc = '';
  profile.resume_filename = '';
  profile.resume_origin = ''

  return profile;
}

function writeToCsvFile(profile) {
  const ws = fs.createWriteStream("./profiles.csv");
  fastcsv
    .write(profile, { headers: true })
    .pipe(ws);
}
