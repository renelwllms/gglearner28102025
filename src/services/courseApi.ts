export default {
  // Get list of all courses
  getCourses: {
    url: '/api/course/list',
    method: 'get',
  },

  getUnits: {
    url: '/api/course/units',
    method: 'get',
  },

  // Get course details by ID
  getCourse: {
    url: '/api/course/:courseId',
    method: 'get',
  },

  // Add a new course
  addCourse: {
    url: '/api/course',
    method: 'post',
  },
  // Add a new course
  deleteUnitStandard: {
    url: '/api/course/deleteUnitStandard',
    method: 'post',
  },
  // Add a new course
  deleteSchool: {
    url: '/api/course/deleteSchool',
    method: 'post',
  },

  // Update course details
  updateCourse: {
    url: '/api/course',
    method: 'put',
  },

  // Delete a course
  deleteCourse: {
    url: '/api/course',
    method: 'delete',
  },
  updateUnitstandard: {
    url: '/api/course/unitstandard',
    method: 'post',
  },
  // Add a new course
  addSchool: {
    url: '/api/course/addSchool',
    method: 'post',
  },

  // Update course details
  updateSchool: {
    url: '/api/course',
    method: 'put',
  },

  // Get courses with categories for settings
  getCoursesWithCategories: {
    url: '/api/course/coursesWithCategories',
    method: 'get',
  },

  // Get unit standards with categories for settings
  getUnitStandardsWithCategories: {
    url: '/api/course/unitStandardsWithCategories',
    method: 'get',
  },

  // Update course category
  updateCourseCategory: {
    url: '/api/course/updateCourseCategory',
    method: 'put',
  },

  // Update unit standard category
  updateUnitStandardCategory: {
    url: '/api/course/updateUnitStandardCategory',
    method: 'put',
  },

  // Get category notification settings
  getCategoryNotificationSettings: {
    url: '/api/course/getCategoryNotificationSettings',
    method: 'get',
  },

  // Update category notification email
  updateCategoryNotificationEmail: {
    url: '/api/course/updateCategoryNotificationEmail',
    method: 'put',
  },
};
