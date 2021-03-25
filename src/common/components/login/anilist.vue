<template>
  <div class="step login-al" @keydown.enter="login">
    <c-button
      v-if="cancel"
      flat
      type="white"
      :icon="arrowSvg"
      :click="cancel"
      class="back-button"
    />

    <a v-tooltip.top="'AniList'" href="https://anilist.co" class="logo">
      <span v-html="alLogo" />
    </a>

    <c-button content="Connect" :click="login" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator"
import { mdiArrowLeft } from "@mdi/js"

import anilistLogoSvg from "@/assets/anilist.svg"
import CButton from "@/common/components/button.vue"
import { Anilist } from "@/lib/anilist"

@Component({ components: { CButton } })
export default class LoginAl extends Vue {
  @Prop(Function) public onFinished!: (() => any) | null
  @Prop(Function) public cancel!: (() => any) | null

  public alLogo = anilistLogoSvg
  public arrowSvg = mdiArrowLeft

  public async login() {
    const result = await Anilist.login()

    await Anilist.updateUserData(this.$store, result)

    this.onFinished && this.onFinished()
  }
}
</script>

<style scoped lang="scss">
.login-al {
  display: flex;
  flex-direction: column;
  align-items: center;

  & > .back-button {
    position: absolute;
    top: 5px;
    left: 5px;
  }

  & > .logo {
    margin: 15px;

    &,
    & ::v-deep svg {
      height: 75px;
      width: 75px;
    }
  }

  & > .text-input {
    margin: 0 25px 8px;

    & ::v-deep input {
      text-align: center;
    }
  }

  & > .button:last-child {
    width: 100%;
    padding: 10px;
  }
}
</style>
