<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 头部的的警告区域 -->
      <el-alert
        show-icon title="注意：只允许为第三级分类设置相关参数" type="warning" :closable="false">
      </el-alert>
      <!-- 选择商品的区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 选择商品分类的级联选择器 -->
          <el-cascader
            v-model="selectedCateKeys"
            :options="catList"
            :props="cateProps"
            @change="handleChange">
          </el-cascader>
        </el-col>
      </el-row>
      <!-- tab页签区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabsClick">
        <!-- 动态参数面板 -->
        <el-tab-pane label="动态参数" name="many">
          <!-- 添加动态参数按钮 -->
          <el-button type="primary" :disabled="selectedCateKeys.length === 0" 
          size="mini" @click="addDialogVisible = true">添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" 
                closable @close="handleClose(i, scope.row)">
                  {{ item }}
                </el-tag>
                <!-- 输入的对话框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)">
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name">
            </el-table-column>
             <el-table-column label="操作">
               <template slot-scope="scope">
                 <!-- 编辑按钮 -->
                 <el-button type="primary" size="mini" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">修改</el-button>
                 <!-- 删除按钮 -->
                 <el-button type="danger" size="mini" icon="el-icon-delete"  @click="removeParams(scope.row.attr_id)">删除</el-button>
               </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 静态属性面板 -->
        <el-tab-pane label="静态属性" name="only">
          <!-- 添加静态属性按钮 -->
          <el-button type="primary" :disabled="selectedCateKeys.length === 0" size="mini"
          @click="addDialogVisible = true">添加属性</el-button>
             <!-- 静态属性表格 -->
          <el-table :data="onlyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" 
                closable @close="handleClose(i, scope.row)">
                  {{ item }}
                </el-tag>
                <!-- 输入的对话框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)">
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name">
            </el-table-column>
             <el-table-column label="操作">
               <template slot-scope="scope">
                 <!-- 编辑按钮 -->
                 <el-button type="primary" size="mini" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">修改</el-button>
                 <!-- 删除按钮 -->
                 <el-button type="danger" size="mini" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">删除</el-button>
               </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加参数/属性 对话框 -->
    <el-dialog
      :title="'添加' + titleText"
      :visible.sync="addDialogVisible"
      width="50%" @close="addDialogClosed">
      <!-- 添加参数/属性 表单 -->
      <el-form :model="addForm" :rules="addFormRule" ref="addFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 添加修改对话框  -->
    <el-dialog
      :title="'修改' + titleText"
      :visible.sync="editDialogVisible"
      width="50%" @close="editDialogClosed">
      <!-- 添加参数/属性 表单 -->
      <el-form :model="editForm" :rules="editFormRule" ref="editFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      // 商品分类列表
      catList: [],
      // 级联选择框的配置对象
      cateProps: {
        value:'cat_id',
        label:'cat_name',
        children:'children',
        expandTrigger: 'hover',
      },
      // 级联选择框双向绑定到的数组
      selectedCateKeys: [],
      // 默认选中的Tab页
      activeName: 'many',
      // 动态参数表格数据
      manyTableData: [],
      // 静态属性表格数据
      onlyTableData: [],
      // 控制添加参数/属性的对话框显示与隐藏
      addDialogVisible: false,
      // 控制表单的数据对象
      addForm: {
        attr_name: ''
      },
      // 验证表单的规则对象
      addFormRule: {
        attr_name: [
          { required: true, message: '请输入名称', trigger: 'blur' }
        ],
      },
      // 控制修改对话框的显示与隐藏
      editDialogVisible: false,
      // 修改的表单数据对象
      editForm:{

      },
      // 修改表单的验证规则对象
       editFormRule: {
        attr_name: [
          { required: true, message: '请输入名称', trigger: 'blur' }
        ],
      },
    }
  },
  created() {
    this.getCatList()
  },
  methods: {
    // 获取所有的商品分类列表
    async getCatList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) return this.$message.error('获取商品分类失败！')
      this.catList = res.data
      console.log(this.catList)
    },
    // 级联选择框选择值发生变化触发的事件
    handleChange() {
     this.getParamsData()
    },
    // 获取参数的列表数据
    async getParamsData() {
       //如果数组长度小于三则选中的不是三级分类 
      if (this.selectedCateKeys.length !== 3)
      {
        this.selectedCateKeys = []
        // 选择二级分类不应该展示对应的参数所以清空
        this.manyTableData = []
        this.onlyTableData = []
        return 
      }
      // console.log(this.selectedCateKeys)
      // 根据所选分类的Id和面板来获取对应的参数
      const {data:res} = await this.$http.get(`categories/${this.cateId}/attributes`, 
      { params: {sel: this.activeName} })
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数列表失败！')
      }
      // 将参数对象转化为数组
      res.data.forEach(item=> {
        item.attr_vals = item.attr_vals?item.attr_vals.split(' '):[]
        item.inputVisible = false
        item.inputValue = ''
      })
      console.log(res.data)
      if (this.activeName === 'many')
      {
        this.manyTableData = res.data
      }
      else{
        this.onlyTableData = res.data
      }
    },
    // 监听Tabs页点击的事件
    handleTabsClick() {
      console.log(this.activeName)
      this.getParamsData()
    },
    // 监听对话框的关闭事件重置表单
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 点击确定时添加参数
    addParams() {
      this.$refs.addFormRef.validate(async valid => {
      if (!valid) return
      const {data:res} = await this.$http.post(`categories/${this.cateId}/attributes`, 
      {
        attr_name: this.addForm.attr_name,
        attr_sel: this.activeName
      })

      if (res.meta.status !== 201) 
      {
        return this.$message.error('添加参数失败！')
      }
      this.$message.success('添加参数成功！')
      this.getParamsData()
      this.addDialogVisible = false
      
      })
    },
    // 监听点击修改按钮弹出对话框事件
    async showEditDialog(attr_id) {
      const {data: res} = await this.$http.get(`categories/${this.cateId}
      /attributes/${attr_id}`, {
        params: { attr_sel: this.activeName }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数信息失败！')
      }
      this.editForm = res.data
      console.log(this.editForm)
      this.editDialogVisible = true
    },
    //监听修改对话框的关闭事件 
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 点击确定时修改参数
    editParams() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const {data: res} = await this.$http.put(`categories/
        ${this.cateId}/attributes/${this.editForm.attr_id}
        `,{
          attr_name: this.editForm.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 200)
        {
          return this.$message.error('修改参数失败！')
        }
        this.$message.success('修改参数成功！')
        this.getParamsData()
        this.editDialogVisible = false
      })
    },
    // 监听点击删除事件并弹框提示
    async removeParams(attr_id) {
      const confirmRes =  await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'}).catch(err=> err)
        // 用户点击取消删除操作
        if (confirmRes !== 'confirm') 
        {
          return this.$message.info('已取消删除')
        }
        // 删除操作业务
        const {data: res} = await this.$http.delete(`categories/${this.cateId}/attributes/${attr_id}`)
        if (res.meta.status !== 200)
        {
          return this.$message.error('删除失败！')
        }
        this.$message.success('删除成功！')
        this.getParamsData()
    },
    // 按回车键或者失去焦点触发的事件
    async handleInputConfirm(row) {
      // console.log('ok')
      if (row.inputValue.trim().length === 0)
      {
        row.inputValue = ''
        row.inputVisible = false
        return 
      }
      // 输入内容添加
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
       // 调用函数保存到数据库
      this.saveAttrVals(row)
      
    },
    // 将对attr_vals保存到数据库
    async saveAttrVals(row) {
       const {data:res} = await this.$http.put(`categories/${this.cateId}
      /attributes/${row.attr_id}`,{
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(' ')
      })
      if (res.meta.status !== 200)
      {
        return this.$message.error('修改参数失败！')
      }
      this.$message.success('修改参数成功！')
      
    },
    // 点击按钮展示输入文本框
    showInput(row) {
      row.inputVisible = true
      // 让文本框自动获取焦点
      // 页面重新渲染之后执行回调函数代码
      this.$nextTick(_ => {
          this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    // 根据对应的id删除对应的 tag
    handleClose(i, row) {
      row.attr_vals.splice(i,1)
      // 调用函数保存到数据库
      this.saveAttrVals(row)
    }
  },
  computed: {
    // 当前选中的三级分类的Id
    cateId() {
      if (this.selectedCateKeys.length === 3)
      {
        return this.selectedCateKeys[2]
      }
      return null
    },
    // 根据activeName判断显示对应的对话框
    titleText() {
      if (this.activeName === 'many')
      {
        return '动态参数'
      }else{
        return '静态属性'
      }
    }
  }
}
</script>
<style lang="less" scoped>
.cat_opt {
  margin: 15px 0;
}
.el-tag {
  margin: 10px;
}
.input-new-tag {
  width: 120px;
}
</style>