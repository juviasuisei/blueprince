# Blue Prince Spoiler Free Guide & Tracking

An interactive web application that provides a structured, progressive checklist system for tracking completion of game content while preventing spoilers. The system uses a dependency-based reveal mechanism where content is unlocked progressively as users complete prerequisites, ensuring a spoiler-free experience.

## ✨ Features

- **Progressive Content Revelation**: Content unlocks based on completion dependencies
- **Mystery Discovery System**: Hidden items discoverable through keywords or direct interaction
- **Rich Media Support**: Single images and interactive carousels with captions
- **Hierarchical Organization**: Sections, subsections, and items with color-coded themes
- **Progress Tracking**: Visual progress bars at multiple levels
- **Offline Support**: Service worker for offline functionality
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Accessibility**: Full keyboard navigation and screen reader support
- **Performance Optimized**: Lazy loading, efficient DOM operations, and caching

## 🚀 Quick Start

### Option 1: Direct Use

1. Download or clone this repository
2. Open `index.html` in a web browser
3. Start tracking your progress!

### Option 2: Local Development

```bash
# Serve locally (Python)
python -m http.server 8000

# Or with Node.js
npx http-server -p 8000

# Or with live reload
npx live-server --port=8000
```

### Option 3: Production Build

```bash
# Create optimized production build
node build.js

# Deploy the dist/ folder to your web server
```

## 📁 Project Structure

```
blue-prince-guide/
├── index.html          # Main application HTML
├── app.js             # Core application logic
├── data.js            # Data aggregation layer
├── sections.js        # Sections and subsections data
├── checkboxes.js      # Checkbox items data
├── information.js     # Information items data
├── build.js           # Production build script
├── package.json       # Project configuration
├── DEPLOYMENT.md      # Deployment documentation
└── README.md          # This file
```

## 🛠️ Technology Stack

- **Frontend**: Vanilla HTML, CSS, JavaScript
- **Framework**: Alpine.js for reactive state management
- **Styling**: Tailwind CSS for utility-first styling
- **Carousels**: Swiper.js for image galleries
- **Storage**: Browser localStorage for persistence
- **Performance**: Service Worker for caching and offline support

## 📊 Data Structure

### Sections

Organize content into hierarchical sections with color themes:

```javascript
{
  id: "section-id",
  title: "Section Title",
  color: "blue",
  dependencies: ["prerequisite-ids"],
  subsections: [...] // Optional subsections
}
```

### Checkboxes

Interactive items that users can complete:

```javascript
{
  "checkbox-id": {
    title: "Full Title",
    hint: "Hint when unchecked",
    description: "Description when checked",
    dependencies: ["prerequisite-ids"],
    unlockKeyword: "mystery-word", // Makes it a mystery
    images: [{ url: "...", caption: "..." }]
  }
}
```

### Information Items

Non-interactive informational content:

```javascript
{
  "info-id": {
    title: "Information Title",
    description: "Information content",
    dependencies: ["prerequisite-ids"],
    images: [{ url: "...", caption: "..." }]
  }
}
```

## 🎮 How It Works

1. **Progressive Disclosure**: Content is hidden until prerequisites are met
2. **Dependency System**: Each item can depend on completion of other items
3. **Mystery System**: Special items can be unlocked with keywords or direct clicks
4. **State Persistence**: Progress is automatically saved to localStorage
5. **Visual Feedback**: Progress bars and animations provide clear feedback

## 🎨 Customization

### Adding Content

1. Edit `sections.js` to add new sections/subsections
2. Edit `checkboxes.js` to add new interactive items
3. Edit `information.js` to add new informational content
4. Place any local images in an `images/` folder (they'll be copied to production build)
5. Refresh the page to see changes

### Styling

- Colors are defined in the `getColorHex()` function in `app.js`
- Tailwind CSS classes can be modified in `index.html`
- Custom CSS can be added to the `<style>` section

### Behavior

- Modify dependency logic in `checkDependencies()` function
- Adjust mystery system in `tryUnlockMystery()` function
- Customize progress calculations in progress-related functions

## 🔧 Development

### Available Scripts

```bash
npm run build      # Create production build
npm run serve      # Serve with Python
npm run serve-node # Serve with Node.js
npm run dev        # Serve with live reload
npm run deploy     # Build and show deploy instructions
npm run clean      # Remove dist/ folder
npm run analyze    # Show file sizes
npm run debug      # Show debug instructions
```

### Debug Mode

Enable debug mode for additional logging:

```javascript
localStorage.setItem("debug", "true");
```

### Performance Monitoring

The app includes built-in performance monitoring:

- Memory usage tracking
- Load time measurement
- Error logging
- Image loading monitoring

## 🚀 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for comprehensive deployment instructions including:

- Production build process
- Web server configuration (Apache, Nginx)
- Static hosting platforms (Netlify, Vercel, GitHub Pages)
- Performance optimizations
- Security considerations

## 🔒 Privacy & Security

- **Local Storage Only**: All data is stored locally in the browser
- **No External Tracking**: No analytics or tracking by default
- **Secure Headers**: Production build includes security headers
- **Input Validation**: All user inputs are validated
- **XSS Protection**: Content Security Policy prevents XSS attacks

## ♿ Accessibility

- **Keyboard Navigation**: Full keyboard support for all functionality
- **Screen Reader Support**: ARIA labels and live regions
- **High Contrast**: Supports high contrast mode
- **Focus Management**: Clear focus indicators
- **Semantic HTML**: Proper heading hierarchy and landmarks

## 🎯 Performance

### Optimizations Included

- **Lazy Loading**: Images load only when needed
- **Debounced Operations**: Reduced localStorage writes
- **Efficient DOM Updates**: Batched operations and minimal reflows
- **Service Worker**: Offline caching and faster repeat visits
- **Memory Management**: Automatic cleanup and monitoring
- **Optimized Carousels**: Efficient initialization and rendering

### Performance Metrics

- **First Load**: ~2-3 seconds on 3G
- **Repeat Visits**: ~500ms with service worker
- **Memory Usage**: <20MB typical usage
- **Bundle Size**: ~50KB total (minified)

## 🐛 Troubleshooting

### Common Issues

**Images Not Loading**

- Check image URLs in data files
- Verify internet connection
- Check browser console for CORS errors

**Progress Not Saving**

- Check if localStorage is enabled
- Verify browser privacy settings
- Check for storage quota issues

**Performance Issues**

- Enable debug mode to monitor performance
- Check browser developer tools
- Clear browser cache

### Getting Help

1. Check browser console for errors
2. Enable debug mode for detailed logging
3. Review the troubleshooting section in DEPLOYMENT.md
4. Check recent errors: `app.getRecentErrors()` in console

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Development Guidelines

- Follow existing code style
- Add comments for complex logic
- Test on multiple browsers
- Ensure accessibility compliance
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Alpine.js** for reactive functionality
- **Tailwind CSS** for styling system
- **Swiper.js** for carousel functionality
- **Community** for feedback and contributions

## 📈 Roadmap

- [ ] Unit testing framework
- [ ] Content management interface
- [ ] Export/import functionality
- [ ] Multiple theme support
- [ ] Advanced analytics
- [ ] Multi-language support

---

**Made with ❤️ for spoiler-free gaming experiences**
