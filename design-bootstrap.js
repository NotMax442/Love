(() => {
    try {
        const savedDesign = localStorage.getItem('app_design');
        const savedTheme = localStorage.getItem('app_theme');
        document.documentElement.setAttribute(
            'data-design',
            savedDesign === 'new-dashboard' ? 'new-dashboard' : 'current'
        );
        if (savedTheme === 'light') {
            document.documentElement.setAttribute('data-theme', 'light');
        }
    } catch (error) {
        document.documentElement.setAttribute('data-design', 'current');
    }
})();
