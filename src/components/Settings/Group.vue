<template functional>
<div class="group">
  <slot/>
</div>
</template>

<style scoped lang="scss">
.group {
  position: relative;
  display: inline-flex;
  flex-direction: column;
  align-items: stretch;

  & > svg {
    height: 100%;
    width: 100%;
  }
}
</style>
