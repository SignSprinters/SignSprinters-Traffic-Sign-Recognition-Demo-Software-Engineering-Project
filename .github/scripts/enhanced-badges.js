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
    console.log(`Command failed: ${command}`);
    return fallback;
  }
}

function countFiles(extensions) {
  let count = 0;
  extensions.forEach(ext => {
    try {
      const cmd = ext.startsWith('.') 
        ? `find . -name "*${ext}" -type f | grep -v node_modules | grep -v .git | wc -l`
        : `find . -name "*${ext}*" -type f | grep -v node_modules | grep -v .git | wc -l`;
      
      const result = execSync(cmd, { encoding: 'utf8' });
      count += parseInt(result.trim()) || 0;
    } catch (err) {
      console.log(`Error counting ${ext}:`, err.message);
    }
  });
  return count;
}

function analyzeRepo() {
  console.log('🔍 Analyzing repository...');
  
  const stats = {
    commits: parseInt(safeExec('git rev-list --count HEAD', '0')),
    pythonFiles: countFiles(['.py']),
    mlFiles: countFiles(['.pkl', '.h5', '.joblib', 'model', '.onnx', '.pt', '.pth']),
    dataFiles: countFiles(['.csv', '.json', '.xlsx', '.parquet', 'data', 'dataset']),
    docFiles: countFiles(['.md', '.rst', '.txt', 'README', 'CHANGELOG', 'LICENSE']),
    testFiles: countFiles(['test', '_test', '.test', 'spec']),
    webFiles: countFiles(['.html', '.css', '.js', '.jsx']),
    configFiles: countFiles(['.yml', '.yaml', '.toml', '.ini', 'Dockerfile', 'requirements'])
  };
  
  console.log('📊 Stats:', JSON.stringify(stats, null, 2));
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
    const badgeUrl = `https://img.shields.io/badge/${encodeURIComponent(ach.name)}-${encodeURIComponent(ach.desc)}-${ach.color}?style=for-the-badge`;
    section += `![${ach.name}](${badgeUrl})\n`;
  });
  section += '\n</div>\n\n';
  
  section += '### 📊 Stats\n\n';
  section += `- 🐍 Python Files: **${stats.pythonFiles}**\n`;
  section += `- 🤖 ML Files: **${stats.mlFiles}**\n`;
  section += `- 📊 Data Files: **${stats.dataFiles}**\n`;
  section += `- 📚 Doc Files: **${stats.docFiles}**\n`;
  section += `- 🧪 Test Files: **${stats.testFiles}**\n`;
  section += `- 🌐 Web Files: **${stats.webFiles}**\n`;
  section += `- ⚙️ Config Files: **${stats.configFiles}**\n`;
  section += `- 📝 Commits: **${stats.commits}**\n\n`;
  
  const progress = Math.round((earned.length / Object.keys(achievements).length) * 100);
  section += `**Progress: ${earned.length}/${Object.keys(achievements).length} badges (${progress}%)**\n\n`;
  section += `*Updated: ${new Date().toLocaleString()}*\n\n`;
  
  return section;
}

function main() {
  try {
    console.log('🚦 Starting SignSprinters Badge System...');
    
    const stats = analyzeRepo();
    const earned = checkEarned(stats);
    
    console.log(`🏆 Earned ${earned.length} badges:`, earned);
    
    // Save data
    const data = { earned, stats, updated: new Date().toISOString() };
    fs.mkdirSync('.github', { recursive: true });
    fs.writeFileSync('.github/achievements.json', JSON.stringify(data, null, 2));
    
    // Update README
    let readme = fs.existsSync('README.md') ? 
      fs.readFileSync('README.md', 'utf8') : 
      '# SignSprinters Traffic Sign Recognition\n\nWelcome to our project!\n';
    
    // More precise replacement - look for the exact achievements section
    const achievementRegex = /## 🏆 SignSprinters Achievements[\s\S]*?(?=## [^🏆]|\n---|\n#(?!#)|$)/g;
    readme = readme.replace(achievementRegex, generateBadgeSection(earned, stats).substring(1)); // Remove leading newline
    
    // If no achievements section exists, add it before Getting Started
    if (!readme.includes('## 🏆 SignSprinters Achievements')) {
      const insertPoints = [
        '## Getting Started',
        '### Prerequisites',
        '## Installation',
        '## Usage'
      ];
      
      let inserted = false;
      for (const point of insertPoints) {
        if (readme.includes(point)) {
          readme = readme.replace(point, generateBadgeSection(earned, stats) + point);
          inserted = true;
          break;
        }
      }
      
      if (!inserted) {
        readme += generateBadgeSection(earned, stats);
      }
    }
    
    fs.writeFileSync('README.md', readme);
    console.log('✅ Badges updated successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
