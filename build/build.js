const fs = require('fs-extra');
const path = require('path');
const handlebars = require('handlebars');

// Helper functions for Handlebars
handlebars.registerHelper('eq', function(a, b) {
    return a === b;
});

handlebars.registerHelper('json', function(context) {
    return JSON.stringify(context);
});

class SiteBuilder {
    constructor() {
        this.baseDir = path.join(__dirname, '..');
        this.templatesDir = path.join(this.baseDir, 'templates');
        this.dataDir = path.join(this.baseDir, 'data');
        this.buildDir = path.join(this.baseDir, 'build/dist');
        
        // Load data
        this.siteData = this.loadData('site.json');
        this.projectsData = this.loadData('projects.json');
        
        // Compile templates
        this.layoutTemplate = this.compileTemplate('layout.hbs');
        this.projectDetailTemplate = this.compileTemplate('project-detail.hbs');
        
        // Register partials
        this.registerPartials();
    }
    
    loadData(filename) {
        try {
            const filePath = path.join(this.dataDir, filename);
            const content = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(content);
        } catch (error) {
            console.error(`Error loading ${filename}:`, error.message);
            return {};
        }
    }
    
    compileTemplate(filename) {
        try {
            const filePath = path.join(this.templatesDir, filename);
            const content = fs.readFileSync(filePath, 'utf8');
            return handlebars.compile(content);
        } catch (error) {
            console.error(`Error compiling template ${filename}:`, error.message);
            return () => '';
        }
    }
    
    registerPartials() {
        const partialsDir = path.join(this.templatesDir, 'partials');
        if (fs.existsSync(partialsDir)) {
            const partialFiles = fs.readdirSync(partialsDir);
            partialFiles.forEach(file => {
                if (path.extname(file) === '.hbs') {
                    const partialName = path.basename(file, '.hbs');
                    const partialPath = path.join(partialsDir, file);
                    const partialContent = fs.readFileSync(partialPath, 'utf8');
                    handlebars.registerPartial(partialName, partialContent);
                }
            });
        }
    }
    
    async build() {
        console.log('🚀 Building site...');
        
        // Ensure build directory exists
        await fs.ensureDir(this.buildDir);
        
        try {
            // Build project detail pages
            await this.buildProjectPages();
            
            // Copy static assets
            await this.copyAssets();
            
            console.log('✅ Build completed successfully!');
        } catch (error) {
            console.error('❌ Build failed:', error.message);
            console.error(error.stack);
        }
    }
    
    async buildProjectPages() {
        console.log('📄 Building project detail pages...');
        
        for (const [projectKey, projectData] of Object.entries(this.projectsData)) {
            const pageData = {
                title: projectData.title,
                path: `${projectData.slug}-details.html`,
                activeNav: 'works',
                customCss: [
                    'css/modal_style.css',
                    'css/fukidashi.css'
                ]
            };
            
            const content = this.projectDetailTemplate({
                project: projectData,
                site: this.siteData,
                page: pageData
            });
            
            const html = this.layoutTemplate({
                content: content,
                site: this.siteData,
                page: pageData
            });
            
            const outputPath = path.join(this.buildDir, `${projectData.slug}-details.html`);
            await fs.writeFile(outputPath, html);
            console.log(`  ✓ Generated: ${projectData.slug}-details.html`);
        }
    }
    
    async copyAssets() {
        console.log('📦 Copying static assets...');
        
        const assetDirs = ['css', 'js', 'images', 'fonts'];
        
        for (const dir of assetDirs) {
            const srcPath = path.join(this.baseDir, dir);
            const destPath = path.join(this.buildDir, dir);
            
            if (fs.existsSync(srcPath)) {
                await fs.copy(srcPath, destPath);
                console.log(`  ✓ Copied: ${dir}/`);
            }
        }
    }
    
    watch() {
        console.log('👀 Watching for changes...');
        const chokidar = require('chokidar');
        
        const watchPaths = [
            path.join(this.templatesDir, '**/*.hbs'),
            path.join(this.dataDir, '*.json')
        ];
        
        const watcher = chokidar.watch(watchPaths, {
            ignored: /node_modules/,
            persistent: true
        });
        
        watcher
            .on('change', (filePath) => {
                console.log(`📝 File changed: ${path.relative(this.baseDir, filePath)}`);
                this.build();
            })
            .on('ready', () => {
                console.log('✅ Initial scan complete. Ready for changes.');
                this.build();
            });
    }
}

// Export for programmatic use
module.exports = SiteBuilder;

// CLI usage
if (require.main === module) {
    const builder = new SiteBuilder();
    
    const command = process.argv[2];
    
    if (command === 'watch') {
        builder.watch();
    } else {
        builder.build();
    }
} 