    // ========================
    // Constants & Initial Data
    // ========================
    const WHOLESALERS = [
      '東都商事', '中央流通', '西日本卸', '北辰物産', '南海トレード'
    ];

    const MANUFACTURERS = [
      '星空製菓', '桜菓房', '風月堂', '旭飴本舗', '翔和ビスケット',
      '葵堂', '華月糖果', '夕凪キャンディ', '大和コンフェク', '瑞穂ショコラ',
      '麗峰パイ', '翠松煎餅', '朱鷺ラムネ', '千歳キャラメル', '燦光モナカ',
      '清流マシュマロ', '極光クラッカー', '若葉タルト', '月光ドラジェ', '琥珀ボンボン'
    ];

    const CATEGORIES = [
      '飴', 'チョコ', 'クッキー', 'せんべい', 'その他'
    ];

    // ========================
    // Product Code Generation
    // ========================
    const MANUFACTURER_CODES = {
      '星空製菓': 'HK', '桜菓房': 'SK', '風月堂': 'FG', '旭飴本舗': 'AS', '翔和ビスケット': 'SW',
      '葵堂': 'AO', '華月糖果': 'KG', '夕凪キャンディ': 'YN', '大和コンフェク': 'YM', '瑞穂ショコラ': 'MZ',
      '麗峰パイ': 'RH', '翠松煎餅': 'SM', '朱鷺ラムネ': 'TK', '千歳キャラメル': 'CT', '燦光モナカ': 'SN',
      '清流マシュマロ': 'SR', '極光クラッカー': 'KK', '若葉タルト': 'WB', '月光ドラジェ': 'GK', '琥珀ボンボン': 'KH'
    };

    const CATEGORY_CODES = {
      '飴': 'AM',
      'チョコ': 'CH',
      'クッキー': 'CK',
      'せんべい': 'SB',
      'その他': 'OT'
    };

    function generateProductCode(manufacturerName, category) {
      console.log('generateProductCode 呼び出し:', { manufacturerName, category });

      const manufacturerCode = MANUFACTURER_CODES[manufacturerName] || 'XX';
      const categoryCode = CATEGORY_CODES[category] || 'XX';

      console.log('コード変換:', { manufacturerCode, categoryCode });

      if (manufacturerCode === 'XX') {
        console.warn('メーカーコード未登録:', manufacturerName);
      }
      if (categoryCode === 'XX') {
        console.warn('カテゴリコード未登録:', category);
      }

      // Get all existing products for this manufacturer and category
      const products = dataStore.getProducts();
      console.log('既存商品数:', products.length);

      const sameTypeProducts = products.filter(p =>
        p.manufacturerName === manufacturerName && p.category === category
      );
      console.log('同種商品数:', sameTypeProducts.length);

      // Calculate next sequence number
      const sequenceNumber = sameTypeProducts.length + 1;
      const paddedNumber = String(sequenceNumber).padStart(4, '0');

      const productCode = `${manufacturerCode}-${categoryCode}-${paddedNumber}`;
      console.log('生成された商品コード:', productCode);

      return productCode;
    }

    // ========================
    // Utility Functions
    // ========================
    function escapeHtml(text) {
      const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      };
      return String(text).replace(/[&<>"']/g, m => map[m]);
    }

    function escapeJsString(text) {
      if (!text) return '';
      return String(text)
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/"/g, '\\"')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r');
    }

    function uuid() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }

    function formatDate(isoString) {
      const date = new Date(isoString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}/${month}/${day} ${hours}:${minutes}`;
    }

    function formatDateShort(isoString) {
      const date = new Date(isoString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}/${month}/${day}`;
    }

    function formatFileSize(bytes) {
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    function readFileAsBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }

    function parseCsv(text) {
      const lines = text.trim().split('\n');
      if (lines.length === 0) return { headers: [], rows: [] };

      function parseLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          const nextChar = line[i + 1];

          if (char === '"') {
            if (inQuotes && nextChar === '"') {
              current += '"';
              i++;
            } else {
              inQuotes = !inQuotes;
            }
          } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        result.push(current.trim());
        return result;
      }

      const headers = parseLine(lines[0]);
      const rows = lines.slice(1).map(line => parseLine(line));

      return { headers, rows };
    }

    function downloadFile(base64, filename, mime) {
      const link = document.createElement('a');
      link.href = `data:${mime};base64,${base64}`;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    function showToast(message, type = 'info') {
      const container = document.getElementById('toast-container');
      const toast = document.createElement('div');
      toast.className = `toast toast-${type}`;

      const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
      };

      toast.innerHTML = `
        <div class="toast-icon">${icons[type] || icons.info}</div>
        <div class="toast-message">${message}</div>
      `;

      container.appendChild(toast);

      setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => container.removeChild(toast), 300);
      }, 3000);
    }

    // ========================
    // LocalStorage Wrapper
    // ========================
    const storage = {
      load(key, defaultValue = null) {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : defaultValue;
      },
      save(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
      },
      clear() {
        localStorage.clear();
      }
    };

    // ========================
    // Data Models
    // ========================
    const dataStore = {
      getProducts() {
        return storage.load('products', []);
      },
      saveProducts(products) {
        storage.save('products', products);
      },
      addProduct(product) {
        const products = this.getProducts();
        products.push(product);
        this.saveProducts(products);
      },
      updateProduct(id, updates) {
        const products = this.getProducts();
        const index = products.findIndex(p => p.id === id);
        if (index !== -1) {
          products[index] = { ...products[index], ...updates, updatedAt: new Date().toISOString() };
          this.saveProducts(products);
        }
      },
      deleteProduct(id) {
        const products = this.getProducts().filter(p => p.id !== id);
        this.saveProducts(products);
      },
      getProduct(id) {
        return this.getProducts().find(p => p.id === id);
      },

      getQuoteRequests() {
        return storage.load('quoteRequests', []);
      },
      saveQuoteRequests(requests) {
        storage.save('quoteRequests', requests);
      },
      addQuoteRequest(request) {
        const requests = this.getQuoteRequests();
        requests.push(request);
        this.saveQuoteRequests(requests);
      },
      updateQuoteRequest(id, updates) {
        const requests = this.getQuoteRequests();
        const index = requests.findIndex(r => r.id === id);
        if (index !== -1) {
          requests[index] = { ...requests[index], ...updates, updatedAt: new Date().toISOString() };
          this.saveQuoteRequests(requests);
        }
      },
      getQuoteRequest(id) {
        return this.getQuoteRequests().find(r => r.id === id);
      },

      getQuotes() {
        return storage.load('quotes', []);
      },
      saveQuotes(quotes) {
        storage.save('quotes', quotes);
      },
      addQuote(quote) {
        const quotes = this.getQuotes();
        quotes.push(quote);
        this.saveQuotes(quotes);
      },
      getQuotesByRequest(requestId) {
        return this.getQuotes().filter(q => q.requestId === requestId);
      },
      deleteQuoteRequest(requestId) {
        // Delete the request
        const requests = this.getQuoteRequests();
        const newRequests = requests.filter(r => r.id !== requestId);
        this.saveQuoteRequests(newRequests);

        // Delete all related quotes
        const quotes = this.getQuotes();
        const newQuotes = quotes.filter(q => q.requestId !== requestId);
        this.saveQuotes(newQuotes);

        // Delete related read status
        const statuses = this.getReadStatus();
        const newStatuses = statuses.filter(s => s.requestId !== requestId);
        this.saveReadStatus(newStatuses);

        return true;
      },

      getReadStatus() {
        return storage.load('readStatus', []);
      },
      saveReadStatus(status) {
        storage.save('readStatus', status);
      },
      markAsRead(wholesalerName, requestId) {
        const statuses = this.getReadStatus();
        const existing = statuses.find(s =>
          s.wholesalerName === wholesalerName && s.requestId === requestId
        );
        if (!existing) {
          statuses.push({
            wholesalerName,
            requestId,
            readAt: new Date().toISOString()
          });
          this.saveReadStatus(statuses);
        }
      },
      isRead(wholesalerName, requestId) {
        const statuses = this.getReadStatus();
        return statuses.some(s =>
          s.wholesalerName === wholesalerName && s.requestId === requestId
        );
      }
    };

    // ========================
    // App State
    // ========================
    const app = {
      currentUser: null,
      currentRoute: '#login',
      filterState: {},

      init() {
        this.currentUser = storage.load('currentUser');
        this.setupRouter();
        this.navigate(window.location.hash || '#login');
      },

      setupRouter() {
        window.addEventListener('hashchange', () => {
          this.navigate(window.location.hash);
        });
      },

      navigate(hash) {
        if (window.location.hash !== hash) {
          window.location.hash = hash;
          return;
        }

        this.currentRoute = hash;
        const routes = {
          '#login': () => this.renderLogin(),
          '#products/register': () => this.renderProductRegister(),
          '#products/list': () => this.renderProductList(),
          '#requests/inbox': () => this.renderRequestsInbox(),
          '#catalog': () => this.renderCatalog(),
          '#requests/sent': () => this.renderRequestsSent()
        };

        if (hash.startsWith('#detail/product/')) {
          const id = hash.split('/')[2];
          this.renderProductDetail(id);
        } else if (hash.startsWith('#detail/request/')) {
          const id = hash.split('/')[2];
          this.renderRequestDetail(id);
        } else if (routes[hash]) {
          routes[hash]();
        } else {
          this.navigate('#login');
        }
      },

      login(role, company) {
        this.currentUser = { role, company };
        storage.save('currentUser', this.currentUser);
        this.updateHeader();

        if (role === 'manufacturer') {
          this.navigate('#products/register');
        } else {
          this.navigate('#catalog');
        }
      },

      logout() {
        this.currentUser = null;
        storage.save('currentUser', null);
        this.navigate('#login');
      },

      getUnreadCount() {
        if (!this.currentUser || this.currentUser.role !== 'wholesaler') return 0;

        const requests = dataStore.getQuoteRequests()
          .filter(r => r.wholesalerName === this.currentUser.company && r.status === 'quoted');

        return requests.filter(r => !dataStore.isRead(this.currentUser.company, r.id)).length;
      },

      updateHeader() {
        const header = document.getElementById('app-header');
        const navTabs = document.getElementById('nav-tabs');
        const userBadge = document.getElementById('user-badge');

        if (!this.currentUser) {
          header.classList.add('hidden');
          return;
        }

        header.classList.remove('hidden');
        userBadge.textContent = `${this.currentUser.role === 'manufacturer' ? 'メーカー' : '問屋'} - ${this.currentUser.company}`;

        const unreadCount = this.getUnreadCount();
        const tabs = this.currentUser.role === 'manufacturer'
          ? [
              { hash: '#products/register', label: '商品登録' },
              { hash: '#products/list', label: '登録商品一覧' },
              { hash: '#requests/inbox', label: '受信見積依頼' }
            ]
          : [
              { hash: '#catalog', label: '商品カタログ' },
              { hash: '#requests/sent', label: '送信済み見積依頼', badge: unreadCount }
            ];

        navTabs.innerHTML = tabs.map(tab => `
          <button class="nav-tab ${this.currentRoute === tab.hash ? 'active' : ''}"
                  onclick="app.navigate('${tab.hash}')">
            ${tab.label}
            ${tab.badge && tab.badge > 0 ? `<span class="badge-count">${tab.badge}</span>` : ''}
          </button>
        `).join('');
      },

      // ========================
      // Login Screen
      // ========================
      renderLogin() {
        this.updateHeader();
        const main = document.getElementById('main-content');
        main.innerHTML = `
          <div class="login-container">
            <h1 class="login-title">🍬 お菓子管理システム</h1>
            <form onsubmit="app.handleLogin(event)">
              <div class="form-group">
                <label class="form-label">ロール選択<span class="form-required">*</span></label>
                <select class="form-select" id="login-role" required onchange="app.updateCompanyList()">
                  <option value="">選択してください</option>
                  <option value="wholesaler">問屋</option>
                  <option value="manufacturer">メーカー</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">会社選択<span class="form-required">*</span></label>
                <select class="form-select" id="login-company" required disabled>
                  <option value="">ロールを選択してください</option>
                </select>
              </div>
              <button type="submit" class="btn btn-primary btn-block">ログイン</button>
            </form>
          </div>
        `;
      },

      updateCompanyList() {
        const role = document.getElementById('login-role').value;
        const companySelect = document.getElementById('login-company');

        if (!role) {
          companySelect.disabled = true;
          companySelect.innerHTML = '<option value="">ロールを選択してください</option>';
          return;
        }

        const companies = role === 'wholesaler' ? WHOLESALERS : MANUFACTURERS;
        companySelect.disabled = false;
        companySelect.innerHTML = `
          <option value="">選択してください</option>
          ${companies.map(c => `<option value="${c}">${c}</option>`).join('')}
        `;
      },

      handleLogin(e) {
        e.preventDefault();
        const role = document.getElementById('login-role').value;
        const company = document.getElementById('login-company').value;

        if (!role || !company) {
          showToast('ロールと会社を選択してください', 'error');
          return;
        }

        this.login(role, company);
        showToast('ログインしました', 'success');
      },

      // ========================
      // Product Register (Manufacturer)
      // ========================
      renderProductRegister() {
        if (!this.currentUser || this.currentUser.role !== 'manufacturer') {
          this.navigate('#login');
          return;
        }

        this.updateHeader();
        const main = document.getElementById('main-content');
        main.innerHTML = `
          <div class="card">
            <h2 class="card-title">新規商品登録</h2>
            <form onsubmit="app.handleProductSubmit(event)" id="product-form">
              <div class="form-group">
                <label class="form-label">商品名<span class="form-required">*</span></label>
                <input type="text" class="form-input" id="product-name" required>
              </div>

              <div class="form-group">
                <label class="form-label">カテゴリ<span class="form-required">*</span></label>
                <select class="form-select" id="product-category" required>
                  <option value="">選択してください</option>
                  ${CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('')}
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">商品説明</label>
                <textarea class="form-textarea" id="product-description"></textarea>
              </div>

              <div class="form-group">
                <label class="form-label">希望小売価格（円）<span class="form-required">*</span></label>
                <input type="number" class="form-input" id="product-price" required min="0">
              </div>

              <div class="form-group">
                <label class="form-label">ロット数（個/箱）<span class="form-required">*</span></label>
                <input type="number" class="form-input" id="product-lot" required min="1">
              </div>

              <div class="form-group">
                <label class="form-label">商品画像</label>
                <div class="dropzone" id="image-dropzone"
                     ondragover="app.handleDragOver(event)"
                     ondragleave="app.handleDragLeave(event)"
                     ondrop="app.handleImageDrop(event)"
                     onclick="document.getElementById('image-input').click()">
                  <div class="dropzone-icon">📷</div>
                  <div class="dropzone-text">クリックまたはドラッグ&ドロップで画像を追加</div>
                  <div class="dropzone-hint">JPG, PNG, GIF (最大5MB)</div>
                </div>
                <input type="file" id="image-input" class="hidden" accept="image/*" onchange="app.handleImageSelect(event)">
                <div id="image-preview" class="image-preview hidden"></div>
              </div>

              <div class="form-group">
                <label class="form-label">商品資料（CSV/PDF）</label>
                <div class="dropzone" id="files-dropzone"
                     ondragover="app.handleDragOver(event)"
                     ondragleave="app.handleDragLeave(event)"
                     ondrop="app.handleFilesDrop(event)"
                     onclick="document.getElementById('files-input').click()">
                  <div class="dropzone-icon">📄</div>
                  <div class="dropzone-text">クリックまたはドラッグ&ドロップで資料を追加</div>
                  <div class="dropzone-hint">CSV, PDF (各最大10MB、複数可)</div>
                </div>
                <input type="file" id="files-input" class="hidden" accept=".csv,.pdf" multiple onchange="app.handleFilesSelect(event)">
                <div id="files-list" class="file-list"></div>
              </div>

              <button type="submit" class="btn btn-primary btn-block">商品を登録</button>
            </form>
          </div>
        `;

        this.productFormData = {
          image: null,
          files: []
        };
      },

      handleDragOver(e) {
        e.preventDefault();
        e.currentTarget.classList.add('drag-over');
      },

      handleDragLeave(e) {
        e.currentTarget.classList.remove('drag-over');
      },

      handleImageDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');
        const files = Array.from(e.dataTransfer.files);
        const imageFile = files.find(f => f.type.startsWith('image/'));
        if (imageFile) {
          this.processImage(imageFile);
        }
      },

      handleImageSelect(e) {
        const file = e.target.files[0];
        if (file) {
          this.processImage(file);
        }
      },

      async processImage(file) {
        // 画像サイズを制限（localStorageの容量問題を防ぐ）
        if (file.size > 500 * 1024) { // 500KB制限
          showToast('画像サイズは500KB以下にしてください（容量制限のため）', 'error');
          return;
        }

        try {
          const base64 = await readFileAsBase64(file);
          this.productFormData.image = {
            filename: file.name,
            mime: file.type,
            size: file.size,
            base64
          };
        } catch (error) {
          console.error('画像処理エラー:', error);
          showToast('画像の処理に失敗しました', 'error');
        }

        const preview = document.getElementById('image-preview');
        preview.className = 'image-preview';
        preview.innerHTML = `
          <div style="position: relative; display: inline-block;">
            <img src="data:${file.type};base64,${base64}" alt="プレビュー">
            <button type="button" class="btn btn-danger" style="position: absolute; top: 0.5rem; right: 0.5rem;" onclick="app.removeImage()">削除</button>
          </div>
        `;
      },

      removeImage() {
        this.productFormData.image = null;
        document.getElementById('image-preview').className = 'image-preview hidden';
        document.getElementById('image-input').value = '';
      },

      handleFilesDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');
        const files = Array.from(e.dataTransfer.files);
        this.processFiles(files);
      },

      handleFilesSelect(e) {
        const files = Array.from(e.target.files);
        this.processFiles(files);
      },

      async processFiles(files) {
        for (const file of files) {
          if (file.size > 10 * 1024 * 1024) {
            showToast(`${file.name} はサイズが大きすぎます（最大10MB）`, 'error');
            continue;
          }

          if (!file.name.match(/\.(csv|pdf)$/i)) {
            showToast(`${file.name} はCSVまたはPDFファイルではありません`, 'error');
            continue;
          }

          const base64 = await readFileAsBase64(file);
          this.productFormData.files.push({
            filename: file.name,
            mime: file.type,
            size: file.size,
            base64
          });
        }

        this.renderFilesList();
      },

      renderFilesList() {
        const container = document.getElementById('files-list');
        if (!this.productFormData || this.productFormData.files.length === 0) {
          container.innerHTML = '';
          return;
        }

        container.innerHTML = this.productFormData.files.map((file, index) => `
          <div class="file-item">
            <div class="file-info">
              <div class="file-icon">${file.mime.includes('pdf') ? '📕' : '📊'}</div>
              <div class="file-details">
                <div class="file-name">${escapeHtml(file.filename)}</div>
                <div class="file-size">${formatFileSize(file.size)}</div>
              </div>
            </div>
            <div class="file-actions">
              <button type="button" class="btn btn-danger" onclick="app.removeFile(${index})">削除</button>
            </div>
          </div>
        `).join('');
      },

      removeFile(index) {
        this.productFormData.files.splice(index, 1);
        this.renderFilesList();
      },

      async handleProductSubmit(e) {
        e.preventDefault();

        try {
          // バリデーション
          if (!this.productFormData) {
            this.productFormData = { image: null, files: [] };
          }

          const manufacturerName = this.currentUser.company;
          const category = document.getElementById('product-category').value;

          console.log('商品登録開始:', { manufacturerName, category });

          // 商品コード生成
          const productCode = generateProductCode(manufacturerName, category);
          console.log('商品コード生成成功:', productCode);

          const product = {
            id: uuid(),
            productCode: productCode,
            manufacturerName: manufacturerName,
            productName: document.getElementById('product-name').value,
            category: category,
            description: document.getElementById('product-description').value,
            price: parseInt(document.getElementById('product-price').value),
            lotSize: parseInt(document.getElementById('product-lot').value),
            imageBase64: this.productFormData.image ? this.productFormData.image.base64 : null,
            imageMime: this.productFormData.image ? this.productFormData.image.mime : null,
            attachments: this.productFormData.files || [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          console.log('商品データ作成:', product);

          dataStore.addProduct(product);
          console.log('商品登録完了');

          showToast(`商品を登録しました（商品コード: ${productCode}）`, 'success');

          document.getElementById('product-form').reset();
          this.productFormData = { image: null, files: [] };
          document.getElementById('image-preview').className = 'image-preview hidden';
          document.getElementById('files-list').innerHTML = '';
        } catch (error) {
          console.error('商品登録エラー:', error);
          showToast(`商品登録に失敗しました: ${error.message}`, 'error');
        }
      },

      // ========================
      // Product List (Manufacturer)
      // ========================
      renderProductList() {
        if (!this.currentUser || this.currentUser.role !== 'manufacturer') {
          this.navigate('#login');
          return;
        }

        this.updateHeader();
        const products = dataStore.getProducts()
          .filter(p => p.manufacturerName === this.currentUser.company)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        const main = document.getElementById('main-content');

        if (products.length === 0) {
          main.innerHTML = `
            <div class="card">
              <div class="empty-state">
                <div class="empty-state-icon">📦</div>
                <div class="empty-state-title">商品が登録されていません</div>
                <div class="empty-state-text">「商品登録」タブから商品を登録してください</div>
              </div>
            </div>
          `;
          return;
        }

        main.innerHTML = `
          <div class="card">
            <h2 class="card-title">登録済み商品一覧（${products.length}件）</h2>
            <div class="product-grid">
              ${products.map(p => `
                <div class="product-card">
                  <div class="product-card-image">
                    ${p.imageBase64
                      ? `<img src="data:${escapeHtml(p.imageMime)};base64,${p.imageBase64}" alt="${escapeHtml(p.productName)}">`
                      : '🍬'
                    }
                  </div>
                  <div class="product-card-content">
                    <div class="product-card-title">${escapeHtml(p.productName)}</div>
                    <div class="product-card-meta" style="margin-bottom: 0.5rem;">
                      <strong style="color: #2563eb;">📦 ${escapeHtml(p.productCode || 'N/A')}</strong>
                    </div>
                    <div class="product-card-meta">
                      <span class="badge badge-primary">${escapeHtml(p.category)}</span>
                    </div>
                    <div class="product-card-price">¥${p.price.toLocaleString()}</div>
                    <div class="product-card-meta">ロット: ${p.lotSize}個</div>
                    <div class="flex gap-1 mt-2">
                      <button class="btn btn-primary" onclick="app.navigate('#detail/product/${p.id}')">詳細</button>
                      <button class="btn btn-danger" onclick="app.deleteProduct('${p.id}')">削除</button>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      },

      deleteProduct(id) {
        if (confirm('この商品を削除してもよろしいですか？')) {
          dataStore.deleteProduct(id);
          showToast('商品を削除しました', 'success');
          this.renderProductList();
        }
      },

      // ========================
      // Requests Inbox (Manufacturer)
      // ========================
      renderRequestsInbox(preserveFilters = false) {
        if (!this.currentUser || this.currentUser.role !== 'manufacturer') {
          this.navigate('#login');
          return;
        }

        this.updateHeader();

        // フィルター状態を保存
        if (preserveFilters) {
          this.filterState.requestsInbox = {
            status: document.getElementById('filter-status')?.value || '',
            wholesaler: document.getElementById('filter-wholesaler')?.value || '',
            search: document.getElementById('search-input')?.value || ''
          };
        }

        const requests = dataStore.getQuoteRequests()
          .filter(r => r.manufacturerName === this.currentUser.company)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        const main = document.getElementById('main-content');

        if (requests.length === 0) {
          main.innerHTML = `
            <div class="card">
              <div class="empty-state">
                <div class="empty-state-icon">📬</div>
                <div class="empty-state-title">見積依頼がありません</div>
                <div class="empty-state-text">問屋から見積依頼が届くとここに表示されます</div>
              </div>
            </div>
          `;
          return;
        }

        const savedFilters = this.filterState.requestsInbox || {};

        main.innerHTML = `
          <div class="card">
            <h2 class="card-title">受信見積依頼（${requests.length}件）</h2>
            <div class="filters">
              <div class="filter-group">
                <label class="form-label">ステータス</label>
                <select class="form-select" id="filter-status" onchange="app.renderRequestsInbox(true)">
                  <option value="">すべて</option>
                  <option value="pending" ${savedFilters.status === 'pending' ? 'selected' : ''}>未対応</option>
                  <option value="quoted" ${savedFilters.status === 'quoted' ? 'selected' : ''}>見積提出済</option>
                </select>
              </div>
              <div class="filter-group">
                <label class="form-label">問屋</label>
                <select class="form-select" id="filter-wholesaler" onchange="app.renderRequestsInbox(true)">
                  <option value="">すべて</option>
                  ${WHOLESALERS.map(w => `<option value="${w}" ${savedFilters.wholesaler === w ? 'selected' : ''}>${w}</option>`).join('')}
                </select>
              </div>
              <div class="search-box">
                <label class="form-label">検索</label>
                <input type="text" class="search-input" id="search-input" placeholder="商品名・問屋名で検索" value="${savedFilters.search || ''}" oninput="app.renderRequestsInbox(true)">
              </div>
            </div>
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>依頼ID</th>
                    <th>商品名</th>
                    <th>依頼元問屋</th>
                    <th>依頼日時</th>
                    <th>ステータス</th>
                    <th>アクション</th>
                  </tr>
                </thead>
                <tbody>
                  ${this.filterRequests(requests).map(r => `
                    <tr ${r.status === 'pending' ? 'style="background-color: #fef3c7;"' : ''}>
                      <td>${escapeHtml(r.id.substring(0, 8))}</td>
                      <td><strong>${escapeHtml(r.productName)}</strong></td>
                      <td>${escapeHtml(r.wholesalerName)}</td>
                      <td>${formatDate(r.createdAt)}</td>
                      <td>
                        ${r.status === 'pending'
                          ? '<span class="badge badge-warning">🔔 未対応</span>'
                          : '<span class="badge badge-success">✓ 見積提出済</span>'
                        }
                      </td>
                      <td>
                        ${r.status === 'pending'
                          ? `<button class="btn btn-success" onclick="app.showQuoteUploadModal('${r.id}')" style="font-weight: bold;">📄 見積書を送る</button>`
                          : `<button class="btn btn-primary" onclick="app.navigate('#detail/request/${r.id}')">詳細を見る</button>`
                        }
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        `;
      },

      filterRequests(requests) {
        const statusFilter = document.getElementById('filter-status')?.value || '';
        const wholesalerFilter = document.getElementById('filter-wholesaler')?.value || '';
        const searchQuery = document.getElementById('search-input')?.value.toLowerCase() || '';

        return requests.filter(r => {
          if (statusFilter && r.status !== statusFilter) return false;
          if (wholesalerFilter && r.wholesalerName !== wholesalerFilter) return false;
          if (searchQuery &&
              !r.productName.toLowerCase().includes(searchQuery) &&
              !r.wholesalerName.toLowerCase().includes(searchQuery)) {
            return false;
          }
          return true;
        });
      },

      // ========================
      // Catalog (Wholesaler)
      // ========================
      renderCatalog(preserveFilters = false) {
        if (!this.currentUser || this.currentUser.role !== 'wholesaler') {
          this.navigate('#login');
          return;
        }

        this.updateHeader();

        // フィルター状態を保存
        if (preserveFilters) {
          this.filterState.catalog = {
            manufacturer: document.getElementById('filter-manufacturer')?.value || '',
            category: document.getElementById('filter-category')?.value || '',
            priceRange: document.getElementById('filter-price-range')?.value || '',
            sortOrder: document.getElementById('sort-order')?.value || 'date-desc',
            search: document.getElementById('search-input')?.value || ''
          };
        }

        const products = dataStore.getProducts();

        const main = document.getElementById('main-content');

        if (products.length === 0) {
          main.innerHTML = `
            <div class="card">
              <div class="empty-state">
                <div class="empty-state-icon">🍬</div>
                <div class="empty-state-title">商品が登録されていません</div>
                <div class="empty-state-text">メーカーが商品を登録するとここに表示されます</div>
              </div>
            </div>
          `;
          return;
        }

        const savedFilters = this.filterState.catalog || {};

        main.innerHTML = `
          <div class="card">
            <h2 class="card-title">商品カタログ（${products.length}件）</h2>
            <div class="filters">
              <div class="filter-group">
                <label class="form-label">メーカー</label>
                <select class="form-select" id="filter-manufacturer" onchange="app.renderCatalog(true)">
                  <option value="">すべて</option>
                  ${MANUFACTURERS.map(m => `<option value="${m}" ${savedFilters.manufacturer === m ? 'selected' : ''}>${m}</option>`).join('')}
                </select>
              </div>
              <div class="filter-group">
                <label class="form-label">カテゴリ</label>
                <select class="form-select" id="filter-category" onchange="app.renderCatalog(true)">
                  <option value="">すべて</option>
                  ${CATEGORIES.map(c => `<option value="${c}" ${savedFilters.category === c ? 'selected' : ''}>${c}</option>`).join('')}
                </select>
              </div>
              <div class="filter-group">
                <label class="form-label">価格範囲</label>
                <select class="form-select" id="filter-price-range" onchange="app.renderCatalog(true)">
                  <option value="" ${!savedFilters.priceRange ? 'selected' : ''}>すべて</option>
                  <option value="0-500" ${savedFilters.priceRange === '0-500' ? 'selected' : ''}>〜500円</option>
                  <option value="500-1000" ${savedFilters.priceRange === '500-1000' ? 'selected' : ''}>500円〜1,000円</option>
                  <option value="1000-2000" ${savedFilters.priceRange === '1000-2000' ? 'selected' : ''}>1,000円〜2,000円</option>
                  <option value="2000-5000" ${savedFilters.priceRange === '2000-5000' ? 'selected' : ''}>2,000円〜5,000円</option>
                  <option value="5000-" ${savedFilters.priceRange === '5000-' ? 'selected' : ''}>5,000円〜</option>
                </select>
              </div>
              <div class="filter-group">
                <label class="form-label">並び替え</label>
                <select class="form-select" id="sort-order" onchange="app.renderCatalog(true)">
                  <option value="date-desc" ${savedFilters.sortOrder === 'date-desc' || !savedFilters.sortOrder ? 'selected' : ''}>登録日時（新しい順）</option>
                  <option value="date-asc" ${savedFilters.sortOrder === 'date-asc' ? 'selected' : ''}>登録日時（古い順）</option>
                  <option value="price-asc" ${savedFilters.sortOrder === 'price-asc' ? 'selected' : ''}>価格（安い順）</option>
                  <option value="price-desc" ${savedFilters.sortOrder === 'price-desc' ? 'selected' : ''}>価格（高い順）</option>
                </select>
              </div>
              <div class="search-box">
                <label class="form-label">検索</label>
                <input type="text" class="search-input" id="search-input" placeholder="商品名・メーカー名・商品コードで検索" value="${savedFilters.search || ''}" oninput="app.renderCatalog(true)">
              </div>
            </div>
            <div class="product-grid">
              ${this.filterAndSortProducts(products).map(p => `
                <div class="product-card" onclick="app.navigate('#detail/product/${p.id}')">
                  <div class="product-card-image">
                    ${p.imageBase64
                      ? `<img src="data:${escapeHtml(p.imageMime)};base64,${p.imageBase64}" alt="${escapeHtml(p.productName)}">`
                      : '🍬'
                    }
                  </div>
                  <div class="product-card-content">
                    <div class="product-card-title">${escapeHtml(p.productName)}</div>
                    <div class="product-card-meta" style="margin-bottom: 0.5rem;">
                      <strong style="color: #2563eb;">📦 ${escapeHtml(p.productCode || 'N/A')}</strong>
                    </div>
                    <div class="product-card-meta">
                      <span class="badge badge-gray">${escapeHtml(p.manufacturerName)}</span>
                      <span class="badge badge-primary">${escapeHtml(p.category)}</span>
                    </div>
                    <div class="product-card-price">¥${p.price.toLocaleString()}</div>
                    <div class="product-card-meta">ロット: ${p.lotSize}個</div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      },

      filterAndSortProducts(products) {
        const manufacturerFilter = document.getElementById('filter-manufacturer')?.value || '';
        const categoryFilter = document.getElementById('filter-category')?.value || '';
        const priceRangeFilter = document.getElementById('filter-price-range')?.value || '';
        const searchQuery = document.getElementById('search-input')?.value.toLowerCase() || '';
        const sortOrder = document.getElementById('sort-order')?.value || 'date-desc';

        let filtered = products.filter(p => {
          if (manufacturerFilter && p.manufacturerName !== manufacturerFilter) return false;
          if (categoryFilter && p.category !== categoryFilter) return false;

          // Price range filter
          if (priceRangeFilter) {
            const [min, max] = priceRangeFilter.split('-').map(Number);
            if (max) {
              if (p.price < min || p.price > max) return false;
            } else {
              if (p.price < min) return false;
            }
          }

          if (searchQuery &&
              !p.productName.toLowerCase().includes(searchQuery) &&
              !p.manufacturerName.toLowerCase().includes(searchQuery) &&
              !(p.productCode && p.productCode.toLowerCase().includes(searchQuery))) {
            return false;
          }
          return true;
        });

        filtered.sort((a, b) => {
          switch (sortOrder) {
            case 'date-asc':
              return new Date(a.createdAt) - new Date(b.createdAt);
            case 'date-desc':
              return new Date(b.createdAt) - new Date(a.createdAt);
            case 'price-asc':
              return a.price - b.price;
            case 'price-desc':
              return b.price - a.price;
            default:
              return 0;
          }
        });

        return filtered;
      },

      // ========================
      // Product Detail
      // ========================
      renderProductDetail(id) {
        if (!this.currentUser) {
          this.navigate('#login');
          return;
        }

        this.updateHeader();
        const product = dataStore.getProduct(id);

        if (!product) {
          showToast('商品が見つかりません', 'error');
          this.navigate(this.currentUser.role === 'manufacturer' ? '#products/list' : '#catalog');
          return;
        }

        const main = document.getElementById('main-content');
        main.innerHTML = `
          <div class="card">
            <div class="flex-between mb-3">
              <h2 class="card-title">商品詳細</h2>
              <button class="btn btn-secondary" onclick="history.back()">戻る</button>
            </div>

            ${product.imageBase64 ? `
              <div class="detail-section">
                <img src="data:${escapeHtml(product.imageMime)};base64,${product.imageBase64}" alt="${escapeHtml(product.productName)}" class="detail-image">
              </div>
            ` : ''}

            <div class="detail-section">
              <div class="detail-label">商品名</div>
              <div class="detail-value" style="font-size: 1.5rem; font-weight: bold;">${escapeHtml(product.productName)}</div>
            </div>

            <div class="detail-section">
              <div class="detail-label">メーカー</div>
              <div class="detail-value">${escapeHtml(product.manufacturerName)}</div>
            </div>

            <div class="detail-section">
              <div class="detail-label">カテゴリ</div>
              <div class="detail-value"><span class="badge badge-primary">${escapeHtml(product.category)}</span></div>
            </div>

            <div class="detail-section">
              <div class="detail-label">希望小売価格</div>
              <div class="detail-value" style="font-size: 1.5rem; font-weight: bold; color: #2563eb;">¥${product.price.toLocaleString()}</div>
            </div>

            <div class="detail-section">
              <div class="detail-label">ロット数</div>
              <div class="detail-value">${product.lotSize}個/箱</div>
            </div>

            ${product.description ? `
              <div class="detail-section">
                <div class="detail-label">商品説明</div>
                <div class="detail-value">${escapeHtml(product.description)}</div>
              </div>
            ` : ''}

            ${product.attachments && product.attachments.length > 0 ? `
              <div class="detail-section">
                <div class="detail-label">添付資料</div>
                <div class="file-list">
                  ${product.attachments.map((file, fileIndex) => `
                    <div class="file-item">
                      <div class="file-info">
                        <div class="file-icon">${file.mime.includes('pdf') ? '📕' : '📊'}</div>
                        <div class="file-details">
                          <div class="file-name">${escapeHtml(file.filename)}</div>
                          <div class="file-size">${formatFileSize(file.size)}</div>
                        </div>
                      </div>
                      <div class="file-actions">
                        ${file.filename.endsWith('.csv') ? `
                          <button class="btn btn-outline" onclick="app.previewProductFile('${product.id}', ${fileIndex})">プレビュー</button>
                        ` : ''}
                        <button class="btn btn-primary" onclick="app.downloadProductFile('${product.id}', ${fileIndex})">ダウンロード</button>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            <div class="detail-section">
              <div class="detail-label">登録日時</div>
              <div class="detail-value">${formatDate(product.createdAt)}</div>
            </div>

            ${this.currentUser.role === 'wholesaler' ? `
              <div class="detail-section">
                <button class="btn btn-success btn-block" onclick="app.showQuoteRequestModal('${product.id}')">この商品に見積依頼を送る</button>
              </div>
            ` : ''}
          </div>
        `;
      },

      previewProductFile(productId, fileIndex) {
        const product = dataStore.getProduct(productId);
        if (!product || !product.attachments || !product.attachments[fileIndex]) {
          showToast('ファイルが見つかりません', 'error');
          return;
        }

        const file = product.attachments[fileIndex];
        const text = atob(file.base64);
        const csvData = parseCsv(text);

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
          <div class="modal" onclick="event.stopPropagation()">
            <div class="modal-header">
              <h3 class="modal-title">CSVプレビュー: ${escapeHtml(file.filename)}</h3>
              <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</button>
            </div>
            <div class="modal-body">
              <div class="csv-preview">
                <table>
                  <thead>
                    <tr>
                      ${csvData.headers.map(h => `<th>${escapeHtml(h)}</th>`).join('')}
                    </tr>
                  </thead>
                  <tbody>
                    ${csvData.rows.slice(0, 100).map(row => `
                      <tr>
                        ${row.map(cell => `<td>${escapeHtml(cell)}</td>`).join('')}
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
                ${csvData.rows.length > 100 ? `<p class="mt-2 text-center" style="color: #6b7280;">※先頭100行のみ表示しています</p>` : ''}
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-primary" onclick="app.downloadProductFile('${productId}', ${fileIndex})">ダウンロード</button>
              <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">閉じる</button>
            </div>
          </div>
        `;

        modal.onclick = (e) => {
          if (e.target === modal) modal.remove();
        };

        document.addEventListener('keydown', function escHandler(e) {
          if (e.key === 'Escape') {
            modal.remove();
            document.removeEventListener('keydown', escHandler);
          }
        });

        document.body.appendChild(modal);
      },

      downloadProductFile(productId, fileIndex) {
        const product = dataStore.getProduct(productId);
        if (!product || !product.attachments || !product.attachments[fileIndex]) {
          showToast('ファイルが見つかりません', 'error');
          return;
        }

        const file = product.attachments[fileIndex];
        downloadFile(file.base64, file.filename, file.mime);
      },

      showQuoteRequestModal(productId) {
        const product = dataStore.getProduct(productId);

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
          <div class="modal" onclick="event.stopPropagation()">
            <div class="modal-header">
              <h3 class="modal-title">見積依頼を送信</h3>
              <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</button>
            </div>
            <div class="modal-body">
              <form id="quote-request-form">
                <div class="form-group">
                  <label class="form-label">商品名</label>
                  <input type="text" class="form-input" value="${escapeHtml(product.productName)}" disabled>
                </div>
                <div class="form-group">
                  <label class="form-label">メーカー</label>
                  <input type="text" class="form-input" value="${escapeHtml(product.manufacturerName)}" disabled>
                </div>
                <div class="form-group">
                  <label class="form-label">希望数量<span class="form-required">*</span></label>
                  <input type="number" class="form-input" id="request-quantity" required min="1">
                </div>
                <div class="form-group">
                  <label class="form-label">希望納期</label>
                  <input type="date" class="form-input" id="request-duedate">
                </div>
                <div class="form-group">
                  <label class="form-label">補足メモ</label>
                  <textarea class="form-textarea" id="request-memo"></textarea>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button class="btn btn-success" onclick="app.submitQuoteRequest('${productId}')">見積依頼を送信</button>
              <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">キャンセル</button>
            </div>
          </div>
        `;

        modal.onclick = (e) => {
          if (e.target === modal) modal.remove();
        };

        document.addEventListener('keydown', function escHandler(e) {
          if (e.key === 'Escape') {
            modal.remove();
            document.removeEventListener('keydown', escHandler);
          }
        });

        document.body.appendChild(modal);
      },

      submitQuoteRequest(productId) {
        const product = dataStore.getProduct(productId);
        const quantity = document.getElementById('request-quantity').value;
        const dueDate = document.getElementById('request-duedate').value;
        const memo = document.getElementById('request-memo').value;

        if (!quantity) {
          showToast('希望数量を入力してください', 'error');
          return;
        }

        const request = {
          id: uuid(),
          productId: productId,
          productName: product.productName,
          wholesalerName: this.currentUser.company,
          manufacturerName: product.manufacturerName,
          quantity: parseInt(quantity),
          dueDate: dueDate,
          memo: memo,
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        dataStore.addQuoteRequest(request);
        showToast('見積依頼を送信しました', 'success');

        document.querySelector('.modal-overlay').remove();

        // Force re-render even if already on the same page
        if (window.location.hash === '#requests/sent') {
          this.renderRequestsSent();
        } else {
          this.navigate('#requests/sent');
        }
      },

      // ========================
      // Requests Sent (Wholesaler)
      // ========================
      renderRequestsSent(preserveFilters = false) {
        if (!this.currentUser || this.currentUser.role !== 'wholesaler') {
          this.navigate('#login');
          return;
        }

        this.updateHeader();

        // フィルター状態を保存
        if (preserveFilters) {
          this.filterState.requestsSent = {
            status: document.getElementById('filter-status')?.value || '',
            manufacturer: document.getElementById('filter-manufacturer')?.value || '',
            search: document.getElementById('search-input')?.value || ''
          };
        }

        const requests = dataStore.getQuoteRequests()
          .filter(r => r.wholesalerName === this.currentUser.company)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        const main = document.getElementById('main-content');

        if (requests.length === 0) {
          main.innerHTML = `
            <div class="card">
              <div class="empty-state">
                <div class="empty-state-icon">📤</div>
                <div class="empty-state-title">送信した見積依頼がありません</div>
                <div class="empty-state-text">商品カタログから見積依頼を送信してください</div>
              </div>
            </div>
          `;
          return;
        }

        const savedFilters = this.filterState.requestsSent || {};

        main.innerHTML = `
          <div class="card">
            <h2 class="card-title">送信済み見積依頼（${requests.length}件）</h2>
            <div class="filters">
              <div class="filter-group">
                <label class="form-label">ステータス</label>
                <select class="form-select" id="filter-status" onchange="app.renderRequestsSent(true)">
                  <option value="">すべて</option>
                  <option value="pending" ${savedFilters.status === 'pending' ? 'selected' : ''}>依頼中</option>
                  <option value="quoted" ${savedFilters.status === 'quoted' ? 'selected' : ''}>見積受領済</option>
                </select>
              </div>
              <div class="filter-group">
                <label class="form-label">メーカー</label>
                <select class="form-select" id="filter-manufacturer" onchange="app.renderRequestsSent(true)">
                  <option value="">すべて</option>
                  ${MANUFACTURERS.map(m => `<option value="${m}" ${savedFilters.manufacturer === m ? 'selected' : ''}>${m}</option>`).join('')}
                </select>
              </div>
              <div class="search-box">
                <label class="form-label">検索</label>
                <input type="text" class="search-input" id="search-input" placeholder="商品名・メーカー名で検索" value="${savedFilters.search || ''}" oninput="app.renderRequestsSent(true)">
              </div>
            </div>
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>依頼ID</th>
                    <th>商品名</th>
                    <th>メーカー名</th>
                    <th>依頼日時</th>
                    <th>ステータス</th>
                    <th>アクション</th>
                  </tr>
                </thead>
                <tbody>
                  ${this.filterSentRequests(requests).map(r => {
                    const isRead = dataStore.isRead(this.currentUser.company, r.id);
                    const hasQuote = r.status === 'quoted';
                    return `
                      <tr>
                        <td>${escapeHtml(r.id.substring(0, 8))}</td>
                        <td>${escapeHtml(r.productName)}</td>
                        <td>${escapeHtml(r.manufacturerName)}</td>
                        <td>${formatDate(r.createdAt)}</td>
                        <td>
                          ${r.status === 'pending'
                            ? '<span class="badge badge-warning">依頼中</span>'
                            : `<span class="badge badge-success">見積受領済</span>${!isRead ? '<span class="badge-count">未読</span>' : ''}`
                          }
                        </td>
                        <td>
                          <div style="display: flex; gap: 0.5rem; align-items: center;">
                            <button class="btn btn-primary" onclick="app.navigate('#detail/request/${r.id}')">詳細</button>
                            <button class="btn btn-danger" onclick="app.deleteRequest('${r.id}')">削除</button>
                          </div>
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>
        `;
      },

      filterSentRequests(requests) {
        const statusFilter = document.getElementById('filter-status')?.value || '';
        const manufacturerFilter = document.getElementById('filter-manufacturer')?.value || '';
        const searchQuery = document.getElementById('search-input')?.value.toLowerCase() || '';

        return requests.filter(r => {
          if (statusFilter && r.status !== statusFilter) return false;
          if (manufacturerFilter && r.manufacturerName !== manufacturerFilter) return false;
          if (searchQuery &&
              !r.productName.toLowerCase().includes(searchQuery) &&
              !r.manufacturerName.toLowerCase().includes(searchQuery)) {
            return false;
          }
          return true;
        });
      },

      // ========================
      // Request Detail
      // ========================
      renderRequestDetail(id) {
        if (!this.currentUser) {
          this.navigate('#login');
          return;
        }

        this.updateHeader();
        const request = dataStore.getQuoteRequest(id);

        if (!request) {
          showToast('見積依頼が見つかりません', 'error');
          history.back();
          return;
        }

        const quotes = dataStore.getQuotesByRequest(id);
        const isManufacturer = this.currentUser.role === 'manufacturer';
        const isWholesaler = this.currentUser.role === 'wholesaler';

        if (isWholesaler && request.status === 'quoted') {
          dataStore.markAsRead(this.currentUser.company, id);
        }

        const main = document.getElementById('main-content');
        main.innerHTML = `
          <div class="card">
            <div class="flex-between mb-3">
              <h2 class="card-title">見積依頼詳細</h2>
              <button class="btn btn-secondary" onclick="history.back()">戻る</button>
            </div>

            <div class="detail-section">
              <div class="detail-label">依頼ID</div>
              <div class="detail-value">${request.id}</div>
            </div>

            <div class="detail-section">
              <div class="detail-label">商品名</div>
              <div class="detail-value" style="font-size: 1.25rem; font-weight: bold;">${request.productName}</div>
            </div>

            <div class="detail-section">
              <div class="detail-label">メーカー</div>
              <div class="detail-value">${request.manufacturerName}</div>
            </div>

            <div class="detail-section">
              <div class="detail-label">問屋</div>
              <div class="detail-value">${request.wholesalerName}</div>
            </div>

            <div class="detail-section">
              <div class="detail-label">希望数量</div>
              <div class="detail-value">${request.quantity.toLocaleString()}個</div>
            </div>

            ${request.dueDate ? `
              <div class="detail-section">
                <div class="detail-label">希望納期</div>
                <div class="detail-value">${request.dueDate}</div>
              </div>
            ` : ''}

            ${request.memo ? `
              <div class="detail-section">
                <div class="detail-label">補足メモ</div>
                <div class="detail-value">${request.memo}</div>
              </div>
            ` : ''}

            <div class="detail-section">
              <div class="detail-label">ステータス</div>
              <div class="detail-value">
                ${request.status === 'pending'
                  ? '<span class="badge badge-warning">未対応</span>'
                  : '<span class="badge badge-success">見積提出済</span>'
                }
              </div>
            </div>

            <div class="detail-section">
              <div class="detail-label">依頼日時</div>
              <div class="detail-value">${formatDate(request.createdAt)}</div>
            </div>

            ${isManufacturer && request.status === 'pending' ? `
              <div class="detail-section">
                <button class="btn btn-success btn-block" onclick="app.showQuoteUploadModal('${request.id}')">見積書をアップロード</button>
              </div>
            ` : ''}

            ${quotes.length > 0 ? `
              <div class="detail-section">
                <div class="detail-label">見積書</div>
                ${quotes.map((quote, quoteIndex) => `
                  <div style="margin-bottom: 1rem; padding: 1rem; background: #f9fafb; border-radius: 0.375rem;">
                    <div style="font-size: 0.875rem; color: #6b7280; margin-bottom: 0.5rem;">
                      提出日時: ${formatDate(quote.uploadedAt)}
                    </div>
                    ${quote.memo ? `
                      <div style="margin-bottom: 0.75rem;">
                        <strong>メモ:</strong> ${escapeHtml(quote.memo)}
                      </div>
                    ` : ''}
                    <div class="file-list">
                      ${quote.files.map((file, fileIndex) => `
                        <div class="file-item">
                          <div class="file-info">
                            <div class="file-icon">${file.mime.includes('pdf') ? '📕' : '📊'}</div>
                            <div class="file-details">
                              <div class="file-name">${escapeHtml(file.filename)}</div>
                              <div class="file-size">${formatFileSize(file.size)}</div>
                            </div>
                          </div>
                          <div class="file-actions">
                            ${file.filename.endsWith('.csv') ? `
                              <button class="btn btn-outline" onclick="app.previewQuoteFile('${id}', ${quoteIndex}, ${fileIndex})">プレビュー</button>
                            ` : ''}
                            <button class="btn btn-primary" onclick="app.downloadQuoteFile('${id}', ${quoteIndex}, ${fileIndex})">ダウンロード</button>
                          </div>
                        </div>
                      `).join('')}
                    </div>
                  </div>
                `).join('')}
              </div>
            ` : ''}

            ${isWholesaler ? `
              <div class="detail-section">
                <button class="btn btn-danger btn-block" onclick="app.deleteRequest('${id}')">この見積依頼を削除</button>
              </div>
            ` : ''}
          </div>
        `;
      },

      previewQuoteFile(requestId, quoteIndex, fileIndex) {
        const quotes = dataStore.getQuotesByRequest(requestId);
        if (!quotes || !quotes[quoteIndex] || !quotes[quoteIndex].files || !quotes[quoteIndex].files[fileIndex]) {
          showToast('ファイルが見つかりません', 'error');
          return;
        }

        const file = quotes[quoteIndex].files[fileIndex];
        const text = atob(file.base64);
        const csvData = parseCsv(text);

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
          <div class="modal" onclick="event.stopPropagation()">
            <div class="modal-header">
              <h3 class="modal-title">CSVプレビュー: ${escapeHtml(file.filename)}</h3>
              <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</button>
            </div>
            <div class="modal-body">
              <div class="csv-preview">
                <table>
                  <thead>
                    <tr>
                      ${csvData.headers.map(h => `<th>${escapeHtml(h)}</th>`).join('')}
                    </tr>
                  </thead>
                  <tbody>
                    ${csvData.rows.slice(0, 100).map(row => `
                      <tr>
                        ${row.map(cell => `<td>${escapeHtml(cell)}</td>`).join('')}
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
                ${csvData.rows.length > 100 ? `<p class="mt-2 text-center" style="color: #6b7280;">※先頭100行のみ表示しています</p>` : ''}
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-primary" onclick="app.downloadQuoteFile('${requestId}', ${quoteIndex}, ${fileIndex})">ダウンロード</button>
              <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">閉じる</button>
            </div>
          </div>
        `;

        modal.onclick = (e) => {
          if (e.target === modal) modal.remove();
        };

        document.addEventListener('keydown', function escHandler(e) {
          if (e.key === 'Escape') {
            modal.remove();
            document.removeEventListener('keydown', escHandler);
          }
        });

        document.body.appendChild(modal);
      },

      downloadQuoteFile(requestId, quoteIndex, fileIndex) {
        const quotes = dataStore.getQuotesByRequest(requestId);
        if (!quotes || !quotes[quoteIndex] || !quotes[quoteIndex].files || !quotes[quoteIndex].files[fileIndex]) {
          showToast('ファイルが見つかりません', 'error');
          return;
        }

        const file = quotes[quoteIndex].files[fileIndex];
        downloadFile(file.base64, file.filename, file.mime);
      },

      deleteRequest(requestId) {
        if (!confirm('この見積依頼を削除してもよろしいですか？\n関連する見積書も全て削除されます。')) {
          return;
        }

        if (dataStore.deleteQuoteRequest(requestId)) {
          showToast('見積依頼を削除しました', 'success');
          this.navigate('#requests/sent');
          this.updateHeader(); // Update unread count
        } else {
          showToast('見積依頼の削除に失敗しました', 'error');
        }
      },

      showQuoteUploadModal(requestId) {
        const request = dataStore.getQuoteRequest(requestId);
        if (!request) {
          showToast('見積依頼が見つかりません', 'error');
          return;
        }

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
          <div class="modal" onclick="event.stopPropagation()">
            <div class="modal-header">
              <h3 class="modal-title">📄 見積書を送信</h3>
              <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</button>
            </div>
            <div class="modal-body">
              <div style="padding: 1rem; background-color: #eff6ff; border-radius: 0.5rem; margin-bottom: 1.5rem; border-left: 4px solid #2563eb;">
                <div style="font-weight: bold; margin-bottom: 0.5rem;">📋 見積依頼情報</div>
                <div style="font-size: 0.875rem; color: #1e40af;">
                  <div><strong>商品:</strong> ${escapeHtml(request.productName)}</div>
                  <div><strong>問屋:</strong> ${escapeHtml(request.wholesalerName)}</div>
                  <div><strong>希望数量:</strong> ${request.quantity.toLocaleString()}個</div>
                  ${request.dueDate ? `<div><strong>希望納期:</strong> ${request.dueDate}</div>` : ''}
                </div>
              </div>
              <form id="quote-upload-form">
                <div class="form-group">
                  <label class="form-label">見積書ファイル（CSV/PDF）<span class="form-required">*</span></label>
                  <div class="dropzone" id="quote-dropzone"
                       ondragover="app.handleDragOver(event)"
                       ondragleave="app.handleDragLeave(event)"
                       ondrop="app.handleQuoteFilesDrop(event)"
                       onclick="document.getElementById('quote-files-input').click()">
                    <div class="dropzone-icon">📄</div>
                    <div class="dropzone-text">クリックまたはドラッグ&ドロップでファイルを追加</div>
                    <div class="dropzone-hint">CSV, PDF (各最大10MB、複数ファイル可)</div>
                  </div>
                  <input type="file" id="quote-files-input" class="hidden" accept=".csv,.pdf" multiple onchange="app.handleQuoteFilesSelect(event)">
                  <div id="quote-files-list" class="file-list"></div>
                </div>
                <div class="form-group">
                  <label class="form-label">メモ（任意）</label>
                  <textarea class="form-textarea" id="quote-memo" placeholder="見積内容についての補足説明があれば入力してください"></textarea>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button class="btn btn-success" onclick="app.submitQuote('${requestId}')" style="font-weight: bold; font-size: 1.1rem; padding: 0.875rem 2rem;">
                ✓ ${escapeHtml(request.wholesalerName)} へ送信
              </button>
              <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">キャンセル</button>
            </div>
          </div>
        `;

        modal.onclick = (e) => {
          if (e.target === modal) modal.remove();
        };

        document.addEventListener('keydown', function escHandler(e) {
          if (e.key === 'Escape') {
            modal.remove();
            document.removeEventListener('keydown', escHandler);
          }
        });

        document.body.appendChild(modal);
        this.quoteUploadFiles = [];
      },

      handleQuoteFilesDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');
        const files = Array.from(e.dataTransfer.files);
        this.processQuoteFiles(files);
      },

      handleQuoteFilesSelect(e) {
        const files = Array.from(e.target.files);
        this.processQuoteFiles(files);
      },

      async processQuoteFiles(files) {
        for (const file of files) {
          if (file.size > 10 * 1024 * 1024) {
            showToast(`${file.name} はサイズが大きすぎます（最大10MB）`, 'error');
            continue;
          }

          if (!file.name.match(/\.(csv|pdf)$/i)) {
            showToast(`${file.name} はCSVまたはPDFファイルではありません`, 'error');
            continue;
          }

          const base64 = await readFileAsBase64(file);
          this.quoteUploadFiles.push({
            filename: file.name,
            mime: file.type,
            size: file.size,
            base64
          });
        }

        this.renderQuoteFilesList();
      },

      renderQuoteFilesList() {
        const container = document.getElementById('quote-files-list');
        if (!this.quoteUploadFiles || this.quoteUploadFiles.length === 0) {
          container.innerHTML = '';
          return;
        }

        container.innerHTML = this.quoteUploadFiles.map((file, index) => `
          <div class="file-item">
            <div class="file-info">
              <div class="file-icon">${file.mime.includes('pdf') ? '📕' : '📊'}</div>
              <div class="file-details">
                <div class="file-name">${escapeHtml(file.filename)}</div>
                <div class="file-size">${formatFileSize(file.size)}</div>
              </div>
            </div>
            <div class="file-actions">
              <button type="button" class="btn btn-danger" onclick="app.removeQuoteFile(${index})">削除</button>
            </div>
          </div>
        `).join('');
      },

      removeQuoteFile(index) {
        this.quoteUploadFiles.splice(index, 1);
        this.renderQuoteFilesList();
      },

      submitQuote(requestId) {
        if (this.quoteUploadFiles.length === 0) {
          showToast('見積書ファイルをアップロードしてください', 'error');
          return;
        }

        const request = dataStore.getQuoteRequest(requestId);
        const memo = document.getElementById('quote-memo').value;

        const quote = {
          id: uuid(),
          requestId: requestId,
          manufacturerName: this.currentUser.company,
          files: this.quoteUploadFiles,
          memo: memo,
          uploadedAt: new Date().toISOString()
        };

        dataStore.addQuote(quote);
        dataStore.updateQuoteRequest(requestId, { status: 'quoted' });

        showToast(`✓ ${request.wholesalerName} へ見積書を送信しました（${this.quoteUploadFiles.length}ファイル）`, 'success');
        document.querySelector('.modal-overlay').remove();

        // 受信見積依頼画面に戻る
        this.navigate('#requests/inbox');

        // ヘッダーを更新して未読バッジを反映
        setTimeout(() => this.updateHeader(), 100);
      }
    };

    // ========================
    // Initialize App
    // ========================
    document.addEventListener('DOMContentLoaded', () => {
      app.init();
    });
