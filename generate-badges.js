const fs = require('fs');
const path = require('path');

// Achievement definitions
const achievements = {
  'first-commit': {
    name: 'First Steps',
    description: 'Made your first commit',
    icon: '🚀',
    color: '#FFD700'
  },
  'javascript-master': {
    name: 'JavaScript Master',
    description: 'Added 10+ JavaScript files',
    icon: '💻',
    color: '#F7DF1E'
  },
  'python-guru': {
    name: 'Python Guru', 
    description: 'Added 10+ Python files',
    icon: '🐍',
    color: '#3776AB'
  },
  'markdown-writer': {
    name: 'Documentation Hero',
    description: 'Added 5+ Markdown files',
    icon: '📝',
    color: '#083FA1'
  },
  'css-artist': {
    name: 'Style Master',
    description: 'Added 5+ CSS files',
    icon: '🎨',
    color: '#1572B6'
  },
  'commit-streak': {
    name: 'Consistent Contributor',
    description: 'Made 50+ commits',
    icon: '🔥',
    color: '#FF6B6B'
  },
  'big-contributor': {
    name: 'Major Contributor',
    description: 'Added 100+ files',
    icon: '🏆',
    color: '#FF4757'
  }
};

// Function to count files by extension
function countFilesByExtension(dir) {
  const counts = {};
  
  function traverse(currentDir) {
    try {
      const files = fs.readdirSync(currentDir);
      
      files.forEach(file => {
        const filePath = path.join(currentDir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
          traverse(filePath);
        } else if (stat.isFile()) {
          const ext = path.extname(file).toLowerCase();
          counts[ext] = (counts[ext] || 0) + 1;
        }
      });
    } catch (err) {
      console.log(`Error reading directory ${currentDir}:`, err.message);
    }
  }
  
  traverse(dir);
  return counts;
}

// Function to check which achievements are earned
function checkAchievements(fileCounts, totalFiles) {
  const earned = [];
  
  // Check file type achievements
  if ((fileCounts['.js'] || 0) >= 10) earned.push('javascript-master');
  if ((fileCounts['.py'] || 0) >= 10) earned.push('python-guru');
  if ((fileCounts['.md'] || 0) >= 5) earned.push('markdown-writer');
  if ((fileCounts['.css'] || 0) >= 5) earned.push('css-artist');
  
  // Check total file achievements
  if (totalFiles >= 100) earned.push('big-contributor');
  if (totalFiles >= 1) earned.push('first-commit');
  
  return earned;
}

// Function to generate badge HTML
function generateBadgeHTML(achievementKey) {
  const achievement = achievements[achievementKey];
  return `<div class="achievement-badge" style="display: inline-block; margin: 5px; padding: 10px; background: ${achievement.color}; color: white; border-radius: 10px; text-align: center;">
  <div style="font-size: 24px;">${achievement.icon}</div>
  <div style="font-size: 12px; font-weight: bold;">${achievement.name}</div>
</div>`;
}

// Main execution
try {
  console.log('🔍 Scanning repository for achievements...');
  
  const fileCounts = countFilesByExtension('.');
  const totalFiles = Object.values(fileCounts).reduce((a, b) => a + b, 0);
  
  console.log('📊 File counts:', fileCounts);
  console.log('📁 Total files:', totalFiles);
  
  const earnedAchievements = checkAchievements(fileCounts, totalFiles);
  console.log('🏆 Earned achievements:', earnedAchievements);
  
  // Save achievements data
  const achievementData = {
    earned: earnedAchievements,
    fileCounts: fileCounts,
    totalFiles: totalFiles,
    lastUpdated: new Date().toISOString()
  };
  
  fs.writeFileSync('achievements.json', JSON.stringify(achievementData, null, 2));
  
  // Generate README section
  let badgeSection = '\n## 🏆 Achievements\n\n';
  
  if (earnedAchievements.length === 0) {
    badgeSection += '*No achievements earned yet. Keep coding to unlock badges!*\n';
  } else {
    earnedAchievements.forEach(key => {
      const achievement = achievements[key];
      badgeSection += `![${achievement.name}](https://img.shields.io/badge/${achievement.name.replace(/\s/g, '%20')}-${achievement.description.replace(/\s/g, '%20')}-${achievement.color.replace('#', '')}) `;
    });
    badgeSection += '\n\n';
    
    // Add achievement details
    badgeSection += '### Achievement Details\n';
    earnedAchievements.forEach(key => {
      const achievement = achievements[key];
      badgeSection += `- ${achievement.icon} **${achievement.name}**: ${achievement.description}\n`;
    });
  }
  
  // Update README.md
  let readmeContent = '';
  if (fs.existsSync('README.md')) {
    readmeContent = fs.readFileSync('README.md', 'utf8');
  }
  
  // Remove existing achievement section
  readmeContent = readmeContent.replace(/\n## 🏆 Achievements[\s\S]*?(?=\n## |\n# |$)/g, '');
  
  // Add new achievement section
  readmeContent += badgeSection;
  
  fs.writeFileSync('README.md', readmeContent);
  
  console.log('✅ Achievement badges generated successfully!');
  
} catch (error) {
  console.error('❌ Error generating badges:', error);
  process.exit(1);
}
