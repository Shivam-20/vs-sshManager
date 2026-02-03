# SSH Manager - Enhancement Plan
## More Right-Click Options & Smart Suggestions

### Current Features
- SSH Keys: Generate, Copy Public Key, Delete
- SSH Config: Add, Edit, Delete Host
- Known Hosts: Remove Entry
- SSH Agent: View status (read-only)

---

## Proposed Enhancements

### 1. SSH Keys - Additional Options

#### A. View Public Key (New)
**Description:** Open the public key in a new editor tab
**Benefits:**
- Easy to view full public key content
- Can copy specific parts if needed
- Better than just copying to clipboard

**Location:** Right-click on SSH Key item
**Menu Group:** 1_actions@2 (after "Copy Public Key")

#### B. Change/Remove Passphrase (New)
**Description:** Add, change, or remove passphrase from existing key
**Benefits:**
- Secure keys without passphrase
- Add passphrase to unprotected keys
- Change old passphrases
**Commands:**
- "Add Passphrase" - Set new passphrase
- "Change Passphrase" - Replace existing passphrase
- "Remove Passphrase" - Remove passphrase protection

**Location:** Right-click on SSH Key item
**Menu Group:** 2_modify@2 (after "Delete Key")

#### C. Duplicate Key (New)
**Description:** Create a copy of key with new name
**Benefits:**
- Backup key before modifications
- Create test version
- Template for new keys

**Location:** Right-click on SSH Key item
**Menu Group:** 2_modify@3

---

### 2. SSH Config - Additional Options

#### A. Copy SSH Command (New)
**Description:** Copy full SSH connection command to clipboard
**Example:** `ssh user@hostname -p 22 -i ~/.ssh/id_ed25519`
**Benefits:**
- Quick copy for terminal use
- Includes all connection details
- No need to remember parameters

**Location:** Right-click on SSH Host item
**Menu Group:** 1_actions@1 (before "Edit Host")

#### B. Test Connection (New)
**Description:** Verify SSH connection works
**Actions:**
- Try to connect with `ssh -o ConnectTimeout=5 user@host`
- Show success/failure message
- Provide suggestions if connection fails
**Benefits:**
- Verify host details before using
- Catch configuration errors early
- Helpful troubleshooting

**Location:** Right-click on SSH Host item
**Menu Group:** 1_actions@2 (after "Copy SSH Command")

#### C. Duplicate Host (New)
**Description:** Create copy of host with new name
**Benefits:**
- Create test configuration
- Template for similar servers
- Quick setup for new environments

**Location:** Right-click on SSH Host item
**Menu Group:** 2_modify@3 (after "Delete Host")

#### D. Open in Terminal (New)
**Description:** Open integrated terminal and connect
**Action:** Execute SSH command in VSCode terminal
**Benefits:**
- One-click connection
- Integrated workflow
- No external terminal needed

**Location:** Right-click on SSH Host item
**Menu Group:** 1_actions@3 (after "Test Connection")

---

### 3. Known Hosts - Additional Options

#### A. Copy Host Key (New)
**Description:** Copy the public key for a specific host from known_hosts
**Action:** Extract and copy key to clipboard
**Benefits:**
- Quick reference for server setup
- Compare with local keys
- Troubleshooting aid

**Location:** Right-click on Known Host item
**Menu Group:** 1_actions@1 (before "Remove Entry")

#### B. Remove All Entries (New)
**Description:** Clear all known hosts entries
**Warning:** Show confirmation dialog with count
**Benefits:**
- Clean start when having SSH issues
- Remove outdated entries
- Bulk cleanup

**Location:** Right-click on Known Hosts folder
**Menu Group:** 2_manage@1

---

### 4. General/Global Options

#### A. Open SSH Folder (New)
**Description:** Open ~/.ssh directory in file explorer
**Location:** Right-click on SSH Keys folder
**Menu Group:** inline@2 (after "Generate Key")

#### B. Open Config File (New)
**Description:** Open ~/.ssh/config in editor
**Location:** Right-click on SSH Config folder
**Menu Group:** inline@2 (after "Add Host")

#### C. Generate Key (Global) (Enhancement)
**Description:** Always show "Generate SSH Key" button
**Current:** Only shows when right-clicking folder
**Enhancement:** Also show in command palette + add to view title
**Location:** Command palette + view toolbar (next to refresh)

#### D. Copy All Public Keys (New)
**Description:** Copy all public keys to clipboard (multiline)
**Location:** Right-click on SSH Keys folder
**Menu Group:** 2_manage@1

---

## Smart Suggestions & UX Improvements

### 1. Key Generation Suggestions

#### A. Key Type Recommendation
**Enhancement:** Add "Recommended" badge to ed25519
**Display:**
```
- ed25519 [RECOMMENDED]
- rsa
- ecdsa
- dsa [DEPRECATED]
```
**Benefits:**
- Guide users to best choice
- Highlight outdated options
- Security awareness

#### B. Passphrase Strength Indicator
**Enhancement:** Show passphrase strength when entering
**Levels:** Weak, Fair, Good, Strong
**Display:** Color-coded indicator in input box
**Benefits:**
- Encourage strong passwords
- Security education
- Better key protection

#### C. Post-Generation Actions
**Enhancement:** After generating key, suggest next steps
**Options:**
- [✓] Copy public key to clipboard now
- [✓] Display public key content
- [✓] Add key to SSH agent (if running)
- [✓] Show setup command for remote server
**Benefits:**
- Streamlined workflow
- Reduce manual steps
- Helpful guidance

### 2. Host Management Improvements

#### A. Smart Host Detection
**Enhancement:** Detect and suggest known servers
**Features:**
- Auto-detect from ~/.ssh/config history
- Suggest common patterns (prod, staging, dev)
- Learn from recently used hosts

#### B. Connection History
**Enhancement:** Track and show recently connected hosts
**Display:** "Recent" section in SSH Config folder
**Benefits:**
- Quick access to frequently used servers
- Time-saving
- Better UX

#### C. Import from CSV/JSON
**Enhancement:** Bulk import hosts from file
**Format:**
```json
[
  {
    "name": "server1",
    "hostname": "192.168.1.100",
    "user": "admin",
    "port": 22
  }
]
```
**Benefits:**
- Migrate from other tools
- Share configurations
- Team collaboration

### 3. Error Handling & User Feedback

#### A. Smart Error Messages
**Enhancement:** Provide actionable suggestions with errors
**Examples:**
- "Connection refused" → "Check if SSH server is running"
- "Permission denied" → "Verify username and try different key"
- "Host key verification failed" → "Remove from Known Hosts"

#### B. Progress Indicators
**Enhancement:** Show progress for slow operations
**Operations with progress:**
- Generating large keys (RSA 4096)
- Testing connections to multiple hosts
- Importing configurations
- Bulk operations

#### C. Undo Support
**Enhancement:** Ctrl+Z for recent destructive actions
**Scope:**
- Last deleted key/host/known-host entry
- Undo window: 30 seconds
**Benefits:**
- Safety net for accidental deletions
- Reduced anxiety when using delete actions

### 4. Quick Actions (Command Palette)

#### A. Quick Generate Key
**Command:** "SSH Manager: Quick Generate Key"
**Behavior:** Skip prompts, use defaults
**Defaults:** ed25519, current user@hostname, no passphrase
**Benefits:** 
- One-key generation
- Rapid setup for testing
- Keyboard shortcut friendly

#### B. Quick Add Host
**Command:** "SSH Manager: Quick Add Host"
**Behavior:** Read from clipboard for hostname
**Smart parsing:** Detect `user@host` or `host:port` formats
**Benefits:**
- Copy hostname from browser → Quick Add → Done
- Time-saving
- Frictionless workflow

#### C. Copy Last Public Key
**Command:** "SSH Manager: Copy Latest Public Key"
**Behavior:** Copy most recently generated/modified public key
**Benefits:**
- Quick access for server setup
- No need to navigate tree
- Frequently used action

### 5. Search & Filter

#### A. Search Keys/Hosts
**Enhancement:** Search box in tree view
**Features:**
- Real-time filtering
- Search by name, type, comment
- Highlight matches
**Benefits:**
- Find items in large lists
- Quick access
- Better organization

#### B. Filter by Type
**Enhancement:** Filter dropdown in tree view
**SSH Keys filters:** All, ed25519, rsa, ecdsa
**SSH Hosts filters:** All, Active, Production, Staging
**Benefits:**
- Quick category filtering
- Reduced visual clutter
- Better organization

### 6. Keyboard Shortcuts

#### A. Navigation Shortcuts
**Enhancement:** Keyboard navigation in tree view
**Shortcuts:**
- Arrow keys: Navigate
- Enter: Expand/Collapse
- Space: Select
- Delete: Remove selected
- Ctrl+C: Copy public key
**Benefits:**
- Power user efficiency
- Reduced mouse usage
- Fast workflows

#### B. Action Shortcuts
**Enhancement:** Quick actions for frequently used features
**Proposed shortcuts:**
- Ctrl+Shift+G: Generate Key
- Ctrl+Shift+H: Add Host
- Ctrl+Shift+R: Refresh
- Ctrl+Shift+C: Copy public key
**Benefits:**
- Muscle memory friendly
- Speed improvements
- Professional workflow

---

## Implementation Priority

### Phase 1: Critical (High Impact, Low Effort)
1. ✅ Copy SSH Command (Host)
2. ✅ Test Connection (Host)
3. ✅ View Public Key (Key)
4. ✅ Open SSH Folder
5. ✅ Open Config File
6. ✅ Change/Remove Passphrase (Key)

### Phase 2: Important (Medium Impact, Medium Effort)
1. Open in Terminal (Host)
2. Duplicate Key (Key)
3. Duplicate Host (Host)
4. Copy Host Key (Known Host)
5. Copy All Public Keys
6. Remove All Known Hosts

### Phase 3: Nice to Have (Medium Impact, High Effort)
1. Key Type Recommendation
2. Passphrase Strength Indicator
3. Post-Generation Suggestions
4. Smart Error Messages
5. Undo Support
6. Connection History

### Phase 4: Advanced (High Impact, High Effort)
1. Quick Generate Key
2. Quick Add Host
3. Copy Last Public Key
4. Search & Filter
5. Import from CSV/JSON
6. Keyboard Shortcuts

---

## New Commands Summary

### SSH Keys
- Copy Public Key ✅ (existing)
- Delete Key ✅ (existing)
- **View Public Key** (new)
- **Change Passphrase** (new)
- **Add Passphrase** (new)
- **Remove Passphrase** (new)
- **Duplicate Key** (new)

### SSH Config
- Add Host ✅ (existing)
- Edit Host ✅ (existing)
- Delete Host ✅ (existing)
- **Copy SSH Command** (new)
- **Test Connection** (new)
- **Open in Terminal** (new)
- **Duplicate Host** (new)

### Known Hosts
- Remove Entry ✅ (existing)
- **Copy Host Key** (new)

### General
- Refresh ✅ (existing)
- Generate Key ✅ (existing)
- **Open SSH Folder** (new)
- **Open Config File** (new)
- **Copy All Public Keys** (new)
- **Remove All Known Hosts** (new)

### Command Palette
- **Quick Generate Key** (new)
- **Quick Add Host** (new)
- **Copy Latest Public Key** (new)

---

## Total New Features

**Commands:** 18 new commands
**Right-click options:** 12 new options
**UX improvements:** 10 enhancements
**Security features:** 3 additions

---

## Next Steps

1. Review this plan
2. Approve desired features
3. Prioritize implementation phases
4. Start with Phase 1 (Critical features)
5. Test each feature thoroughly
6. Iterate based on user feedback

---

**Total estimated effort:** Phase 1 (2-3 hours), Phase 2 (4-6 hours), Phase 3 (6-8 hours), Phase 4 (8-12 hours)
