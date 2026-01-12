---
layout: page
---

<script setup>
import { onMounted } from 'vue'
import { withBase } from 'vitepress'

onMounted(() => {
  window.location.href = withBase('/editor/index.html')
})
</script>

# Redirecting to Editor...

<div style="text-align: center; padding: 100px 20px;">
  <p>If you are not redirected automatically, <a :href="withBase('/editor/index.html')">click here</a>.</p>
</div>

