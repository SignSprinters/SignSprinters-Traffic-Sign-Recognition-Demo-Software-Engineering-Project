const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const achievements = {
  'traffic-pioneer': { name: 'Traffic Pioneer', icon: '🚦', color: 'FF6B35', desc: 'First commit' },
  'python-driver': { name: 'Python Driver', icon: '🐍', color: '3776AB', desc: '5+ Python files' },
  'ml-engineer': { name: 'ML Engineer', icon: '🤖', color: 'FF4081', desc: 'ML model files' },
  'data-scientist': { name: 'Data Scientist', icon: '📊', color: '2196F3', desc: 'Dataset files' },
  'doc-master': { name: 'Doc Master', icon: '📚', color: '4CAF50', desc: '3+ docs' },
  'test-engineer': { name: 'Test Engineer', icon: '🧪', color: 'FF9800', desc: 'Test files' },
  'commit-champion': { name: 'Commit Champion', icon: '🏆', color: 'FFD700', desc: '25+ commits' },
  'web-wizard': { name: 'Web Wizard', icon: '🌐', color: '61DAFB', desc: 'HTML/CSS/JS files' },
  'config-master': { name: 'Config Master', icon: '⚙️', color: '9C27B0', desc: 'Config files' }
};

function safeExec(command, fallback = '0') {
  try {
    return execSync(command, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim() || fallback;
  } catch (error) {
    console.log(`Command failed: ${command} - ${error.message}`);
    return fallback;
  }
}

function countFiles(extensions) {
  let count = 0;
  try {
    // More comprehensive file search
    extensions.forEach(ext => {
      try {
        const cmd = ext.startsWith('.') 
          ? `find . -name "*${ext}" -type f | grep -v node_modules | grep -v .git | wc -l`
          : `find . -name "*${ext}*" -type f | grep -v node_modules | grep -v .git | wc -l`;
        
        const result = execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
        count += parseInt(result.trim()) || 0;
      } catch (err) {
        console.log(`Error counting ${ext}:`, err.message);
      }
    });
  } catch (error) {
    console.log('File counting error:', error.message);
  }
  return count;
}

function analyzeRepo() {
  console.log('🔍 Analyzing repository...');
  
  const stats = {
    commits: parseInt(safeExec('git rev-list --count HEAD 2>/dev/null', '0')),
    pythonFiles: countFiles(['.py']),
    mlFiles: countFiles(['.pkl', '.h5', '.joblib', 'model', '.onnx', '.pt', '.pth']),
    dataFiles: countFiles(['.csv', '.json', '.xlsx', '.parquet', 'data', 'dataset']),
    docFiles: countFiles(['.md', '.rst', '.txt', 'README', 'CHANGELOG', 'LICENSE']),
    testFiles: countFiles(['test', '_test', '.test', 'spec']),
    webFiles: countFiles(['.html', '.css', '.js', '.jsx', '.vue', '.angular']),
    configFiles: countFiles(['.yml', '.yaml', '.toml', '.ini', '.conf', 'Dockerfile', 'requirements.txt', 'package.json'])
  };
  
  console.log('📊 Repository statistics:', JSON.stringify(stats, null, 2));
  return stats;
}

function checkEarned(stats) {
  const earned = [];
  
  if (stats.commits >= 1) earned.push('traffic-pioneer');
  if (stats.pythonFiles >= 5) earned.push('python-driver');
  if (stats.mlFiles >= 1) earned.push('ml-engineer');
  if (stats.dataFiles >= 1) earned.push('data-scientist');
  if (stats.docFiles >= 3) earned.push('doc-master');
  if (stats.testFiles >= 1) earned.push('test-engineer');
  if (stats.commits >= 25) earned.push('commit-champion');
  if (stats.webFiles >= 3) earned.push('web-wizard');
  if (stats.configFiles >= 2) earned.push('config-master');
  
  console.log(`🏆 Earned badges: ${earned.join(', ')}`);
  return earned;
}

function generateBadgeSection(earned, stats) {
  let section = '\n## 🏆 SignSprinters Achievements\n\n';
  
  if (earned.length === 0) {
    section += '🚀 *Start coding to earn your first badge!*\n\n';
    return section;
  }
  
  section += '<div align="center">\n\n';
  earned.forEach(key => {
    const ach = achievements[key];
    const badgeUrl = `https://img.shields.io/badge/${encodeURIComponent(ach.name)}-${encodeURIComponent(ach.desc)}-${ach.color}?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K`;
    section += `![${ach.name}](${badgeUrl})\n`;
  });
  section += '\n</div>\n\n';
  
  section += '### 📊 Achievement Stats\n\n';
  section += `- 🐍 Python Files: **${stats.pythonFiles}**\n`;
  section += `- 🤖 ML Files: **${stats.mlFiles}**\n`;
  section += `- 📊 Data Files: **${stats.dataFiles}**\n`;
  section += `- 📚 Doc Files: **${stats.docFiles}**\n`;
  section += `- 🧪 Test Files: **${stats.testFiles}**\n`;
  section += `- 🌐 Web Files: **${stats.webFiles}**\n`;
  section += `- ⚙️ Config Files: **${stats.configFiles}**\n`;
  section += `- 📝 Total Commits: **${stats.commits}**\n\n`;
  
  // Progress bar
  const progress = Math.round((earned.length / Object.keys(achievements).length) * 100);
  const progressBar = '█'.repeat(Math.floor(progress / 10)) + '░'.repeat(10 - Math.floor(progress / 10));
  
  section += `### 🎯 Progress\n\n`;
  section += `**${earned.length}/${Object.keys(achievements).length} badges earned** (${progress}%)\n\n`;
  section += `\`${progressBar}\` ${progress}%\n\n`;
  
  section += `*Last updated: ${new Date().toLocaleString()}*\n\n`;
  
  // Achievement list with descriptions
  section += '### 🏅 Available Achievements\n\n';
  Object.entries(achievements).forEach(([key, ach]) => {
    const status = earned.includes(key) ? '✅' : '⏳';
    section += `${status} **${ach.name}** ${ach.icon} - ${ach.desc}\n`;
  });
  section += '\n';
  
  return section;
}

function updateReadme(earned, stats) {
  const readmePath = 'README.md';
  
  let readme;
  if (fs.existsSync(readmePath)) {
    readme = fs.readFileSync(readmePath, 'utf8');
    console.log('📄 Existing README.md found');
  } else {
    readme = '# SignSprinters Traffic Sign Recognition\n\nWelcome to our project!\n';
    console.log('📄 Creating new README.md');
  }
  
  // Remove existing achievements section (more precise regex)
  const achievementRegex = /\n## 🏆 SignSprinters Achievements[\s\S]*?(?=\n## [^🏆]|\n# [^🏆]|$)/g;
  readme = readme.replace(achievementRegex, '');
  
  // Find the best place to insert achievements
  const sections = readme.split('\n## ');
  if (sections.length > 1) {
    // Insert before the last section or before "Getting Started" if it exists
    const insertIndex = sections.findIndex(section => 
      section.toLowerCase().includes('getting started') || 
      section.toLowerCase().includes('installation') ||
      section.toLowerCase().includes('usage')
    );
    
    if (insertIndex > 0) {
      sections.splice(insertIndex, 0, generateBadgeSection(earned, stats).replace('\n## ', ''));
      readme = sections.join('\n## ');
    } else {
      readme += generateBadgeSection(earned, stats);
    }
  } else {
    readme += generateBadgeSection(earned, stats);
  }
  
  fs.writeFileSync(readmePath, readme);
  console.log('✅ README.md updated successfully');
}

function main() {
  try {
    console.log('🚦 Starting SignSprinters Enhanced Badge System...\n');
    
    // Check if we're in a git repository
    try {
      execSync('git status', { stdio: 'ignore' });
    } catch (error) {
      console.error('❌ Not in a git repository or git not available');
      process.exit(1);
    }
    
    const stats = analyzeRepo();
    const earned = checkEarned(stats);
    
    console.log(`\n🎉 Achievement Summary:`);
    console.log(`   Badges Earned: ${earned.length}/${Object.keys(achievements).length}`);
    console.log(`   Progress: ${Math.round((earned.length / Object.keys(achievements).length) * 100)}%\n`);
    
    // Save achievement data
    const achievementData = {
      earned,
      stats,
      achievements: Object.keys(achievements).map(key => ({
        id: key,
        ...achievements[key],
        earned: earned.includes(key)
      })),
      updated: new Date().toISOString(),
      progress: Math.round((earned.length / Object.keys(achievements).length) * 100)
    };
    
    // Ensure .github directory exists
    if (!fs.existsSync('.github')) {
      fs.mkdirSync('.github', { recursive: true });
    }
    
    fs.writeFileSync('.github/achievements.json', JSON.stringify(achievementData, null, 2));
    console.log('💾 Achievement data saved to .github/achievements.json');
    
    // Update README
    updateReadme(earned, stats);
    
    console.log('\n✨ Badge generation completed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { analyzeRepo, checkEarned, generateBadgeSection, achievements };
