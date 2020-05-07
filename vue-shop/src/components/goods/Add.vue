<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 提示区域 -->
      <el-alert
        :closable="false" title="添加商品信息" type="info" center show-icon>
      </el-alert>
      <!-- 步骤条 -->
      <el-steps :space="200" :active="activeIndex -0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- tab栏区域 -->
      <el-form :model="addForm" :rules="addeFormRule" 
      ref="addeFormRef" label-width="100px" label-position="top">
        <el-tabs :tab-position="'left'" 
        v-model="activeIndex" :before-leave="beforeTabLeave"
        @tab-click="tabClicked">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price" type="number">
              <el-input v-model="addForm.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight" type="number">
              <el-input v-model="addForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number" type="number">
              <el-input v-model="addForm.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addForm.goods_cat"
                :options="cateList"
                :props="cateProps"
                @change="handleChange">
              </el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 渲染表单的Item项 -->
            <el-form-item :label="item.attr_name" 
            v-for="item in manyTableData" :key="item.attr_id">
                <el-checkbox-group v-model="item.attr_vals">
                  <!-- 复选框组 -->
                  <el-checkbox :label="cb" v-for="(cb, i) in item.attr_vals" :key="i" border></el-checkbox>
                </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
           <el-tab-pane label="商品图片" name="3">
             <!-- action表示图片要上传的后台API地址 -->
             <el-upload
              class="upload-demo"
              :action="uploadUrl"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture" :headers="headerObj" :on-success="handleSuccess">
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
           </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器 -->
            <quill-editor v-model="addForm.goods_introduce">

            </quill-editor>
            <!-- 添加商品按钮 -->
            <el-button type="primary" class="btnAdd" @click="addCate">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 图片预览对话框 -->
    <el-dialog
      title="图片预览"
      :visible.sync="previewVisible"
      width="70%">
      <img :src="previewPath" alt="" class="previewImg">
    </el-dialog>
  </div>
</template>
<script>
import _ from 'lodash'
export default {
  data() {
    return {
      // 步骤条默认的步骤条索引
      activeIndex: '0',
      // 添加商品的表单数据对象
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        // 商品所属的分类数组
        goods_cat: [],
        // 图片的数组
        pics: [],
        // 商品介绍
        goods_introduce: '',
        attrs: []
      },
      // 表单验证的规则
      addeFormRule:{
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
         goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'blur' }
        ],
      },
      //商品分类的数组
      cateList: [],
       cateProps: {
        value:'cat_id',
        label:'cat_name',
        children:'children',
        expandTrigger: 'hover',
      },
      // 动态参数数组
      manyTableData: [],
      // 静态属性数组
      onlyTableData: [],
      // 图片要上传的地址
      uploadUrl: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 图片上传的header请求头
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 图片预览存放的路径
      previewPath: '',
      // 控制图片预览对话框显示的变量
      previewVisible: false
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取所有的商品分类数据
    async getCateList() {
      const {data: res} = await this.$http.get('categories')
      if (res.meta.status !==200) {
        return this.$message.error('获取数据失败！')
      }
      this.cateList = res.data
      console.log(this.cateList)
    },
    // 级联选择器选择发生变化时触发的函数
    handleChange() {
      // console.log(this.addForm.goods_cat)
      if (this.addForm.goods_cat.length !== 3)
      {
        this.addForm.goods_cat = []
      }

    },
    beforeTabLeave(activeName, oldActiveName) {
      if (oldActiveName === '0' && this.addForm.goods_cat.length !==3)
      {
        this.$message.error('请先选择商品分类！')
        return false
      }
    },
    // 监听tab栏点击事件
     async tabClicked() {
      // 点击的是动态参数面板
      console.log(this.activeIndex)
      if (this.activeIndex === '1')
      {
        const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`,
        { params: { sel: 'many' } })
        if (res.meta.status !== 200)
        {
          return this.$message.error('获取动态参数失败！')
        }
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals.length === 0? [] : item.attr_vals.split(' ')
        })
        this.manyTableData = res.data
        console.log(this.manyTableData)
      }
      // 表示点击的是静态属性面板
      else if (this.activeIndex === '2')
      {
        const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`,
        { params: { sel: 'only' } })
        if (res.meta.status !== 200)
        {
          return this.$message.error('获取静态属性失败！')
        }
        this.onlyTableData = res.data
        // console.log(this.onlyTableData)
      }
    },
    // 预览图片效果
    handlePreview(file) {
      this.previewPath = file.response.data.url
      this.previewVisible = true
    },
    // 移除图片的操作
    handleRemove(file) {
      const filePath = file.response.data.tmp_path
      // 找到索引值
      const i = this.addForm.pics.findIndex(x => 
      x.pic === filePath)
      this.addForm.pics.splice(i, 1)
      console.log(this.addForm.pics)
    },
    // 监听听图片上传成功的事件
    handleSuccess(response)
    {
      // 拼接得到一个图片信息对象
      const picInfo = { pic: response.data.tmp_path }
      // 将图片信息对象push到pics数组中
      this.addForm.pics.push(picInfo)
      console.log(this.addForm.pics)
    },
    // 点击确认添加商品
    addCate() {
      // console.log(this.addForm)
      this.$refs.addeFormRef.validate( async valid => {
        if (!valid) return this.$message.error('请填写必要的表单项！')
        // 执行相应的业务逻辑
        // 深拷贝为一个新的对象form
        const form = _.cloneDeep(this.addForm)
        form.goods_cat = form.goods_cat.join(',')
        // 处理动态参数
        this.manyTableData.forEach( item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          this.addForm.attrs.push(newInfo)
        })
        // 处理静态属性
        this.onlyTableData.forEach( item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.addForm.attrs.push(newInfo)
        })
        // console.log(this.addForm)
        form.attrs = this.addForm.attrs
        // console.log(form)
        // 发起请求添加商品
        const {data: res} = await this.$http.post('goods', form)
        if (res.meta.status !== 201) 
        {
          this.$message.error('添加商品失败！')
        }
        this.$message.success('添加商品成功！')
        this.$router.push('/goods')

      })
    }
  },
  computed: {
    cateId() {
      if (this.addForm.goods_cat.length === 3)
      {
        return this.addForm.goods_cat[2]
      }
      return null
    }
  }
}
</script>
<style lang="less" scoped>
.el-checkbox {
  margin: 0 15px 0 0 !important;
}
.previewImg {
  width: 100%;
}
.btnAdd {
  margin-top: 15px;
}
</style>