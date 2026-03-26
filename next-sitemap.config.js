/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://dal.com',
  generateRobotsTxt: true,
  exclude: [
      '/admin', 
      '/admin/*',
      '/superadmin',
      '/superadmin/*', 
      '/dashboard', 
      '/dashboard/*', 
      '/rider', 
      '/rider/*',
      '/errand',
      '/errand/*',
      '/driver',
      '/driver/*',
      '/business',
      '/business/*',
      '/auth',
      '/auth/*'
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/superadmin',
          '/dashboard',
          '/auth',
          '/rider',
          '/errand',
          '/driver',
          '/business'
        ],
      },
    ],
  },
};
