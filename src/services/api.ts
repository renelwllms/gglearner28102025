export default {
  getAllStudent: {
    url: '/api/tutor/workshop/allstudent',
    method: 'get',
  },
  getStudentList: {
    url: '/api/student/list',
    method: 'get',
  },
  getStudentImageList: {
    url: '/api/student/image-list',
    method: 'get',
  },
  getStudentImageDownload: {
    url: '/api/student/download',
    method: 'get',
  },
  getStudentResults: {
    url: '/api/student/results',
    method: 'get',
  },
  getStudentCourse: {
    url: '/api/student/Course',
    method: 'get',
  },
  getCourseUnits: {
    url: '/api/student/CourseUnits',
    method: 'get',
  },
  setStudentTutor: {
    url: '/api/student/assignedTeacher',
    method: 'post',
  },
  postStudentInfo: {
    url: '/api/student/update',
    method: 'post',
  },
  addDocument: {
    url: '/api/student/uploaddoc',
    method: 'post'
  },
  deleteDocument: {
    url: '/api/student/deletefile',
    method: 'post'
  },
  deleteStudentInfo: {
    url: '/api/student/delete',
    method: 'post',
  },
  setStudentCourse: {
    url: '/api/student/assigned/course',
    method: 'post',
  },
  submitStudentResult: {
    url: '/api/student/submit-result',
    method: 'post',
  },
  getTutor: {
    url: '/api/tutor/list',
    method: 'get',
  },
  getAllTutorList: {
    url: '/api/tutor/Alllist',
    method: 'get',
  },
  getCourse: {
    url: '/api/course/list',
    method: 'get',
  },
  getUnit: {
    url: '/api/course/unit',
    method: 'get',
  },
  getCourseStudent: {
    url: '/api/tutor/course/student',
    method: 'get',
  },
  getMyStudent: {
    url: '/api/tutor/student',
    method: 'get',
  },
  getAllCourses: {
    url: '/api/student/allCourse',
    method: 'get',
  },
  getAllUnitStandardByCourse: {
    url: '/api/student/AllUnitStandardByCourse',
    method: 'get',
  },
  getWorkshopStudent: {
    url: '/api/tutor/workshop/student',
    method: 'get',
  },
  addWorkshop: {
    url: '/api/tutor/workshop',
    method: 'post',
  },
  postWorkshop: {
    url: '/api/tutor/workshopUpdate',
    method: 'post',
  },
  addWorkshopInfo: {
    url: '/api/tutor/workshop/info',
    method: 'post',
  },
  postWorkshopInfo: {
    url: '/api/tutor/workshop/info/update',
    method: 'post',
  },
  deleteWorkshopInfo: {
    url: '/api/tutor/workshop/info/delete',
    method: 'post',
  },
  addWorkshopInfoExtra: {
    url: '/api/tutor/workshop/info/extra',
    method: 'post',
  },
  addWworkshopstudent: {
    url: '/api/tutor/workshop/workshopstudent',
    method: 'post',
  },
  addStudent: {
    url: '/api/student/Add',
    method: 'post',
  },
  getWorkshop: {
    url: '/api/tutor/workshop',
    method: 'get',
  },
  deleteWorkshop: {
    url: '/api/tutor/workshopDelete',
    method: 'post',
  },
  getWorkshopInforByCode: {
    url: '/api/tutor/workshopInforByCode',
    method: 'get',
  },
  getWorkshopResult: {
    url: '/api/tutor/workshop/result',
    method: 'get',
  },
  getWorkshopCourseResult: {
    url: '/api/tutor/workshop/courseresult',
    method: 'get',
  },
  getCodeUnits: {
    url: '/api/tutor/workshop/course-with-units',
    method: 'get',
  },
  submitResult: {
    url: '/api/tutor/workshop/submit-result',
    method: 'post',
  },
  AddCourse: {
    url: '/api/student/AddCourse',
    method: 'post',
  },
  UpdateCourse: {
    url: '/api/student/UpdateCourse',
    method: 'post',
  },
  deleteCourse: {
    url: '/api/student/DeleteCourse',
    method: 'post',
  },
  addAssessResult: {
    url: '/api/student/AddAssessResult',
    method: 'post',
  },
  WorkshopStatusChange: {
    url: '/api/tutor/workshop/StatusChange',
    method: 'post',
  },
  WorkshopPaymentStatusChange: {
    url: '/api/tutor/workshop/PaymentStatusChange',
    method: 'post',
  },
  RemoteLearnerCertificateRequest: {
    url: '/api/student/SendCertificateRequestEmail',
    method: 'post',
  },
  submitAllResult: {
    url: '/api/tutor/workshop/submitAllresult',
    method: 'post',
  },
  assessAllresult: {
    url: '/api/tutor/workshop/assessAllresult',
    method: 'post',
  },
  verifyCode: {
    url: '/api/tutor/verifyCode',
    method: 'get',
  },
  getSchool: {
    url: '/api/report/school',
    method: 'get',
  },
  getReport1: {
    url: '/api/report/report1',
    method: 'get',
  },
  getReport2: {
    url: '/api/report/report2',
    method: 'get',
  },
  getReport3: {
    url: '/api/report/report3',
    method: 'get',
  },
  getReport4: {
    url: '/api/report/report4',
    method: 'get',
  },
  getReport5: {
    url: '/api/report/report5',
    method: 'get',
  },
  getReport6: {
    url: '/api/report/report6',
    method: 'get',
  },
  getReport7: {
    url: '/api/report/report7',
    method: 'get',
  },
  getDashboard: {
    url: '/api/report/dashboard',
    method: 'get',
  },
  sendEmail: {
    url: '/api/certificate/send',
    method: 'post',
  },
  sendcertificateEmail: {
    url: '/api/certificate/sendcertificate',
    method: 'post',
  },
  downloadcertificate: {
    url: '/api/certificate/downloadCertificate',
    method: 'get',
  },
  sendResultEmail: {
    url: '/api/certificate/sendresult',
    method: 'post',
  },
  sendEmailMicro: {
    url: '/api/certificate/send-micro',
    method: 'post',
  },  
  addTeacher: {
    url: '/api/tutor/addTeacher',
    method: 'post',
  },
  updateTeacher: {
    url: '/api/tutor/updateTeacher',
    method: 'put',
  },
  deleteTeacher: {
    url: '/api/tutor/deleteTeacher',
    method: 'post',
  },
  getActiveAdminUserList: {
    url: '/api/AdminUser/Activelist',
    method: 'get',
  },
  getAdminUserList: {
    url: '/api/AdminUser/Alllist',
    method: 'get',
  },
  getUserActivelist: {
    url: '/api/AdminUser/Activelist',
    method: 'get',
  },
  getByEmail: {
    url: '/api/AdminUser/ByEmail',
    method: 'get',
  },
  addAdminUser: {
    url: '/api/AdminUser/Add',
    method: 'post',
  },
  updateAdminUser: {
    url: '/api/AdminUser/Update',
    method: 'put',
  },
  deleteAdminUser: {
    url: '/api/AdminUser/delete',
    method: 'post',
  },
  getCommunicationTemplates: {
    url: '/api/student/CommTypelist',
    method: 'get',
  },
  getAllTemplates: {
    url: '/api/student/CommTypelist',
    method: 'get',
  },
  deleteEmailTemplate: {
    url: '/api/student/CommTypedelete',
    method: 'post',
  },
  addEmailTemplate: {
    url: '/api/student/CommTypeAdd',
    method: 'post',
  },
  updateEmailTemplate: {
    url: '/api/student/CommTypeUpdate',
    method: 'post',
  },
  getCommunications: {
    url: '/api/student/Commlist',
    method: 'get',
  },  
  updateCommunication: {
    url: '/api/student/CommUpdate',
    method: 'put',
  },
  updateLastCommDate: {
    url: '/api/student/UpdateLastCommDate',
    method: 'put',
  },
  addCommunication: {
    url: '/api/student/CommAdd',
    method: 'post',
  },
  deleteCommunication: {
    url: '/api/student/Commdelete',
    method: 'post',
  },
  getEmailAttachments: {
    url: '/api/student/image-list',
    method: 'get',
  },
  deleteAttachments: {
    url: '/api/student/deletefile',
    method: 'post'
  },
  addAttachments: {
    url: '/api/student/uploaddoc',
    method: 'post'
  },
  sendTestEmail: {
    url: '/api/student/sendTestEmail',
    method: 'post'
  },
  getReport: {
    url: '/api/report/studentreport',
    method: 'get',
  },
};
