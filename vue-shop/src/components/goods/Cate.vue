<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 表格 -->
      <tree-table  class="treeTable"
      :data="cateList" :columns="columns"
      :selection-type="false" :expand-type="false" 
      show-index index-text ="#" border >
        <!--是否有效  -->
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success" 
          v-if="scope.row.cat_deleted === false"
          style="color:lightgreen"></i>
          <i class="el-icon-error" v-else
          style="color:red"></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag type="primary" v-if="scope.row.cat_level === 0" size="mini">一级</el-tag>
          <el-tag type="success" v-else-if="scope.row.cat_level === 1" size="mini">二级</el-tag>
          <el-tag type="warning"  v-else size="mini">三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditCateDialog(scope.row)">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeCate(scope.row.cat_id)">删除</el-button>
        </template>
      </tree-table>
      <!-- 分类区域 -->
      <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[3, 5, 10, 15]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>
    </el-card>
    <!-- 添加分类的对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%" @close="addCateDialogClosed">
      <!-- 添加表单 -->
      <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
        <el-form-item label="活动名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
          <!-- 级联选择器 -->
          <!-- options用来指定数据源 -->
          <!-- props用来指定配置对象 -->
          <el-cascader
            :props="cascaderProps"
            v-model="selectedKeys"
            :options="parentCateList"
            @change="parentCateChanged" 
            clearable ref="elcascaderRefs">
          </el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑分类的对话框 -->
    <el-dialog
      title="编辑分类"
      :visible.sync="editDialogVisible"
      width="50%" @close="editDialogClosed">
      <!-- 编辑表单 -->
      <el-form :model="editForm" :rules="editFormRule" ref="editFormRef" label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCateInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      // 选中父级分类的Id数组
      selectedKeys: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        value:'cat_id',
        label:'cat_name',
        children:'children',
        expandTrigger: 'hover',
         // 父子节点不互相关联
        checkStrictly: true
      },
      // 父级分类的列表数组
      parentCateList: [],
      // 控制添加分类的对话框的显示与隐藏
      addCateDialogVisible:false,
      // 添加对象的表单数据对象
      addCateForm:{
        //将要添加分类的名称
        cat_name:'',
        // 父级分类的id
        cat_pid: 0,
        // 分类的等级， 默认要添加的是一级分类
        cat_level: 0
      },
      // 添加分类表单的验证规则对象
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ],
      },
      // 查询条件
      queryInfo: {
        type:3,
        pagenum: 1,
        pagesize:5
      },
      // 商品分类的列表
      cateList: [],
      // 总数据条数
      total: 0,
      // 为表格指定列的定义
      columns: [
        {
          label:'分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          // 表示将当前列定义为模板列
          type:'template',
          // 表示当前这一列使用模板名称
          template:'isok'
        },
        {
          label: '排序',
          type:'template',
          template:'order'
        },
        {
          label: '操作',
          type:'template',
          template:'opt'
        }
      ],
      // 控制编辑对话框的显示与隐藏
      editDialogVisible: false,
      // 控制表单的数据对象
      editForm: {},
      // 验证表单的规则对象
      editFormRule:{
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ],
      }
    }
  },
  created() {
    this.getcateList()
  },
mounted() {
    // 设置级联选择器点击一级label也能选中
    setInterval(function() {
      document.querySelectorAll('.el-cascader-node__label').forEach(el => {
        el.onclick = function() {
          if (this.previousElementSibling) this.previousElementSibling.click()
        }
      })
    }, 1000)
  },
  methods: {
    // 获取商品分类
    async getcateList() {
      const {data: res} = await this.$http.get('categories', {params: this.queryInfo})
      if (res.meta.status !== 200) 
      {
        return this.$message.error('获取商品分类失败！')
      }
      // 将获取数据赋值给cateList
      this.cateList = res.data.result
      console.log(this.cateList)
      // 赋值商品总条数
      this.total = res.data.total
    },
    // 监听 pagesize改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getcateList()
    }, 
    // 监听pagesnum改变
    handleCurrentChange(newPage) 
    {
      this.queryInfo.pagenum = newPage
      this.getcateList()
    },
    // 显示添加分类对话框
    showAddDialog() {
      // 在展示添加分类对话框之前获取父级分类列表
      this.getParentCateList()
      this.addCateDialogVisible = true
    },
    // 获取父级分类的数据列表
    async getParentCateList() {
      const {data: res} = await this.$http.get('categories', {params: {type:2} })
      if (res.meta.status !== 200) 
      {
        return this.$message.error('获取父级分类数据失败！')
      }
      this.parentCateList = res.data
      // console.log(this.parentCateList)

    },
    // 选择项变化时触发的事件
    parentCateChanged() {
      console.log(this.selectedKeys)
      // 级联选择器选中后下拉框自动收缩
      this.$refs.elcascaderRefs.dropDownVisible = false
      // 如果selectedKeys 数组中的length大于0, 证明选中的父级分类
      // 反之，则说明没有选中任何父级分类
      if (this.selectedKeys.length > 0)
      {
        // 父级分类的Id
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length-1]
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = this.selectedKeys.length
      }
      else{
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
      
    },
    // 级联选择器选择后点击确定触发的函数
    addCate() {
      // console.log(this.addCateForm)
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return
        const {data:res} = await this.$http.post('categories', this.addCateForm)

        if (res.meta.status !== 201) 
        {
          return this.$message.error('添加分类失败！')
        }
        this.$message.success('添加分类成功！')
        this.getcateList()
        this.addCateDialogVisible = false
      })
    },
    // 监听添加分类对话框的关闭事件并重置表单
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
    },
    // 展示编辑分类对话框
    showEditCateDialog(row) {
      // const {data: res} = await this.$http.get('categories/'+ id)
      // if(res.meta.status !== 200) 
      // {
      //   return this.$message.error('获取分类信息失败！')
      // }
      // this.editForm = res.data
      // console.log(this.editForm)
      // this.editDialogVisible = true
      this.editForm = row
      this.editDialogVisible = true
    },
    // 监听对话框的关闭事件
    editDialogClosed() {
      // 重置表单
      this.$refs.editFormRef.resetFields()
    },
    // 修改分类名称之后进行表单预验证并提交代码到数据库
    editCateInfo() {
      this.$refs.editFormRef.validate( async valid => {
        if (!valid) return
        // 发起请求
        const { data: res } = await this.$http.put('categories/' + this.editForm.cat_id, 
        {cat_name: this.editForm.cat_name})
        if (res.meta.status !== 200)
        {
          return this.$message.error('更新分类信息失败！')
        }
        // 关闭对话框， 刷新列表，提示修改成功
        this.editDialogVisible = false
        this.getcateList()
        this.$message.success('更新分类信息成功！')
      })
    },
     // 根据ID删除对应的分类信息
    async removeCate(id) {
      // 弹框询问是否删除
      const confirmResult = await this.$confirm
      (
        '此操作将永久删除该分类, 是否继续?', '提示', 
        {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
        }
      ).catch(err=> err)
      // 如果角色取消删除，confirmResult为字符串 'cancel'
      if (confirmResult !== 'confirm')
      {
        return this.$message.info('已取消删除')
      }
      // 如果角色确认删除，confirmResult为字符串 'confirm'
      const {data: res} = await this.$http.delete('categories/'+ id)
      if (res.meta.status !== 200)
      {
        return this.$message.error('删除分类失败！')
      }
      this.$message.success('删除分类成功！')
      // 刷新分类列表
      this.getcateList()
    },
  }
}
</script>
<style lang="less" scoped>
.treeTable {
  margin-top: 15px;
}
.el-cascader{
  width: 100%;
}
</style>