import { render } from '../lib/view.js';
export default {
  async index(req, res) { return render(res, 'pages/blog.js', { title: 'Blog' }); }
};
