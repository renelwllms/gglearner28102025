export default {
  // Get all microcredential groups
  getGroups: {
    url: '/api/microcredential/groups',
    method: 'get',
  },

  // Get single group details
  getGroup: {
    url: '/api/microcredential/groups/:groupId',
    method: 'get',
  },

  // Get available courses
  getAvailableCourses: {
    url: '/api/microcredential/available-courses',
    method: 'get',
  },

  // Create new group
  createGroup: {
    url: '/api/microcredential/groups',
    method: 'post',
  },

  // Update group
  updateGroup: {
    url: '/api/microcredential/groups/:groupId',
    method: 'put',
  },

  // Delete group
  deleteGroup: {
    url: '/api/microcredential/groups/:groupId',
    method: 'delete',
  },

  // Remove course from group
  removeCourse: {
    url: '/api/microcredential/groups/:groupId/courses/:courseId',
    method: 'delete',
  },
};
