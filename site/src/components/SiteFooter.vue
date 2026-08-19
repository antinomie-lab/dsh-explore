<script setup>
defineProps({ note: { type: String, default: '' } })
</script>

<template>
  <footer class="footer">
    <div class="footer-inner">
      <span class="footer-mark"></span>
      <p>{{ note }}</p>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  border-top: 1px solid var(--line);
}

.footer-inner {
  max-width: 1080px;
  margin: 0 auto;
  padding: 28px 32px;
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 13px;
  color: var(--faint);
}

.footer-inner p {
  margin: 0;
}

.footer-mark {
  width: 9px;
  height: 9px;
  border-radius: 2.5px;
  background: var(--blue);
  flex: none;
}
</style>
