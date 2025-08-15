import blogRoutes from './blog.js';


import featureRoutes from './feature.js';


import { Router } from 'express';
import { render } from '../lib/view.js';
import path from 'path';

const router = Router();

router.get('/', (req, res) => {
  render(res, 'pages/home.html', { title: 'Home' });
});

router.get('/learn', (req, res) => {
  render(res, 'pages/learn.html', { title: 'Learn' });
});

// Auto-load .html pages from views/pages/
router.get('/:page.html', (req, res, next) => {
  const page = req.params.page;
  try {
    render(res, `pages/${page}.html`, { title: page });
  } catch (err) {
    next(); // If file not found, go to 404 handler
  }
});



router.use('/feature', featureRoutes);


router.use('/blog', blogRoutes);

export default router;
