<template>
  <!-- 工具条 -->
  <div id="control" class="drawing-tools" style="top:50px,">
    <div class="drawing-tools-board">
      <!--主体-->
      <ul class="board-items">
        <li
          :class="['board-items' + (index + 1), type.active ? 'active' : '']"
          v-for="(type, index) in types"
          :key="index"
          @click="handleClick(index, type.toolType)"
        >
          <span class="iconfont fs-20" :class="type.icon"></span>
        </li>
      </ul>
      <!-- 选择字体宽度 和颜色的面板--->
      <div class="outboard-rect" v-show="showIndex <= 4">
        <ul class="rectType" :class="[showIndex != 4?'':'w325']">
          <div v-if="showIndex !== 4" class="rectType-lineWidth-wraper" >
            <li
              class="rectType-lineWidth"
              v-for="(weight, idx) in font_weight"
              :key="'weight' + idx"
              @click="handleLineWidth(idx, weight.size)"
            >
              <div
                :class="[weight.active ? 'active' : '']"
                class="rectType-lineWidth-inner"
                :style="{
                  width: weight.size * 2 + 'px',
                  height: weight.size * 2 + 'px'
                }"
              ></div>
            </li>
          </div>
          <div v-else>
            <li class="rectType-fontSize">
              <select v-model="selectedFont" @change="handleFont">
                <option :value="12">小</option>
                <option :value="16">中</option>
                <option :value="20">大</option>
              </select>
            </li>
          </div>

          <li
            class="rectType-color"
            v-for="(color, idx) in outboard_color"
            :key="idx"
            @click="handleColor(idx, color.background)"
          >
            <div
              :class="[color.active ? 'active' : '']"
              class="rectType-color-inner"
              :style="{ borderColor: color.background }"
            ></div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      selectedFont: 16,
      font_weight: [
        {
          active: true,
          size: 3
        },
        {
          active: false,
          size: 6
        },
        {
          active: false,
          size: 10
        }
      ],
      boardcolor: "#000",
      outboard_color: [
        {
          background: "#000",
          active: true
        },
        {
          background: "#fff",
          active: false
        },
        {
          background: "#FF0000",
          active: false
        },
        {
          background: "#FFFF00",
          active: false
        },
        {
          background: "#00FF00",
          active: false
        },
        {
          background: "#00FFFF",
          active: false
        },
        {
          background: "#0000FF",
          active: false
        },
        {
          background: "#FF00FF",
          active: false
        },
        {
          background: "#FFFF80",
          active: false
        }
      ],
      font: 12,
      showFonts: false,
      showIndex: 10,
      types: [
        {
          active: false,
          toolType: 1,
          icon: "icon-square"
        },
        {
          active: false,
          toolType: 2,
          icon: "icon-circle"
        },
        {
          active: false,
          toolType: 3,
          icon: "icon-arrow"
        },
        {
          active: true,
          toolType: 0,
          icon: "icon-pencle"
        },
        {
          active: false,
          toolType: 4,
          icon: "icon-typeface"
        },
        {
          active: false,
          toolType: 5,
          icon: "icon-revoke"
        },
        {
          active: false,
          toolType: 6,
          icon: "icon-download"
        },
        {
          active: false,
          toolType: 7,
          icon: "icon-cancle"
        },
        {
          active: false,
          toolType: 8,
          icon: "icon-complete"
        }
      ]
    };
  },
  methods: {
    handleClick(idx, toolType) {
      this.$emit("toolType", toolType);
      this.types.map((item, index) => {
        if (index === idx) {
          item.active = true;
        } else {
          item.active = false;
        }
      });
      this.showIndex = toolType;
    },
    handleLineType(toolType, lineType) {
      this.$emit("toolType", toolType);
      this.$emit("lineType", lineType);
      this.showIndex = null;
    },
    handleLineWidth(idx, lineWidth) {
      this.$emit("lineWidth", lineWidth);
      this.font_weight.map((item, index) => {
        if (index === idx) {
          item.active = true;
        } else {
          item.active = false;
        }
      });
    },
    handleFont() {
      this.$emit("fontSize", this.selectedFont);
    },
    handleTextType(toolType, textType) {
      this.$emit("toolType", toolType);
      this.$emit("textType", textType);
      this.showIndex = null;
    },
    handleEraserSize(toolType, eraserSize) {
      this.$emit("toolType", toolType);
      this.$emit("eraserSize", eraserSize);
      this.showIndex = null;
    },
    handleColor(idx, lineColor) {
      this.$emit("lineColor", lineColor);
      this.outboard_color.map((item, index) => {
        if (index === idx) {
          item.active = true;
        } else {
          item.active = false;
        }
      });
    },
  }
};
</script>
