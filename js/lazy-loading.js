/**
 * Lazy Loading Enhancement
 * 画像の遅延読み込みを強化（古いブラウザ向けのpolyfill）
 */

(function() {
  'use strict';

  // ネイティブのloading="lazy"をサポートしているかチェック
  if ('loading' in HTMLImageElement.prototype) {
    // ネイティブサポートがある場合は何もしない
    console.log('Native lazy loading is supported');
    return;
  }

  // Intersection Observer APIをサポートしているかチェック
  if ('IntersectionObserver' in window) {
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    
    const imageObserver = new IntersectionObserver(function(entries, observer) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          const img = entry.target;
          
          // data-src属性がある場合はそれを使用、なければsrc属性をそのまま使用
          if (img.dataset.src) {
            img.src = img.dataset.src;
          }
          
          // data-srcset属性がある場合
          if (img.dataset.srcset) {
            img.srcset = img.dataset.srcset;
          }
          
          // loadingクラスを削除し、loadedクラスを追加
          img.classList.remove('loading');
          img.classList.add('loaded');
          
          // 画像の監視を停止
          observer.unobserve(img);
        }
      });
    }, {
      // rootMargin: 画像がビューポートに入る前に読み込みを開始
      rootMargin: '50px 0px',
      threshold: 0.01
    });
    
    // 各画像の監視を開始
    lazyImages.forEach(function(img) {
      img.classList.add('loading');
      imageObserver.observe(img);
    });
    
    console.log('Lazy loading with Intersection Observer initialized');
  } else {
    // Intersection Observer APIもサポートされていない場合は、すぐに全画像を読み込む
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    lazyImages.forEach(function(img) {
      if (img.dataset.src) {
        img.src = img.dataset.src;
      }
      if (img.dataset.srcset) {
        img.srcset = img.dataset.srcset;
      }
    });
    console.log('Fallback: Loading all images immediately');
  }
})();

/**
 * Image Loading Error Handler
 * 画像読み込みエラー時の処理
 */
document.addEventListener('DOMContentLoaded', function() {
  const images = document.querySelectorAll('img');
  
  images.forEach(function(img) {
    img.addEventListener('error', function() {
      // 画像読み込みエラー時のフォールバック
      this.style.display = 'none';
      console.warn('Failed to load image:', this.src);
      
      // 代替テキストを表示する要素を追加（オプション）
      if (this.alt) {
        const altDiv = document.createElement('div');
        altDiv.className = 'image-fallback';
        altDiv.textContent = this.alt;
        altDiv.style.cssText = 'padding: 2rem; background: #f0f0f0; text-align: center; color: #666;';
        this.parentNode.insertBefore(altDiv, this.nextSibling);
      }
    });
  });
});

/**
 * Smooth Scroll Enhancement
 * スムーススクロールの機能拡張
 */
document.addEventListener('DOMContentLoaded', function() {
  // アンカーリンクのスムーススクロール
  const anchorLinks = document.querySelectorAll('a[href^="#"]');
  
  anchorLinks.forEach(function(link) {
    link.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      
      // #のみの場合やフィルターリンクの場合はスキップ
      if (targetId === '#' || targetId === '#0') {
        return;
      }
      
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        e.preventDefault();
        
        // prefers-reduced-motionを考慮
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        targetElement.scrollIntoView({
          behavior: prefersReducedMotion ? 'auto' : 'smooth',
          block: 'start'
        });
        
        // フォーカスを移動（アクセシビリティ）
        targetElement.focus();
        
        // URLを更新
        if (history.pushState) {
          history.pushState(null, null, targetId);
        }
      }
    });
  });
});

/**
 * Focus Visible Polyfill
 * キーボードフォーカス時のみアウトラインを表示
 */
(function() {
  let isUsingKeyboard = false;
  
  // キーボード使用を検出
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Tab') {
      isUsingKeyboard = true;
      document.body.classList.add('keyboard-nav');
    }
  });
  
  // マウス使用を検出
  document.addEventListener('mousedown', function() {
    isUsingKeyboard = false;
    document.body.classList.remove('keyboard-nav');
  });
})();
