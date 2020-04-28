<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
  </el-breadcrumb>
  <!-- 卡片区域 -->
  <el-card>
    <!-- 搜索与添加区域 -->
    <el-row :gutter="20">
      <el-col :span="8">
        <el-input placeholder="请输入内容" class="input-with-select"
         v-model="queryInfo.query" clearable @clear="getUserList">
          <el-button slot="append" icon="el-icon-search" 
          @click="getUserList"></el-button>
        </el-input>
      </el-col>
      <el-col :span="8">
        <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
      </el-col>
    </el-row>
    <!-- 用户列表区域 -->
    <el-table :data="userlist" stripe border>
      <el-table-column type="index" label="#"></el-table-column>
      <el-table-column prop="username" label="姓名"></el-table-column>
      <el-table-column prop="email" label="邮箱"></el-table-column>
      <el-table-column prop="mobile" label="电话"></el-table-column>
      <el-table-column prop="role_name" label="角色"></el-table-column>
      <el-table-column label="状态">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.mg_state" @change="userStateChanged(scope.row)">
          </el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180px">
        <template slot-scope="scope">
          <!-- 修改按钮 -->
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
          <!-- 删除按钮 -->
          <el-button type="danger" icon="el-icon-delete" size="mini"
          @click="removeUserById(scope.row.id)"></el-button>
          <!-- 修改角色按钮 -->
          <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
            <el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页区域 -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[1, 2, 5, 10]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>
    </el-card>
    <!-- 添加用户的对话框 -->
    <el-dialog
      title="提示"
      :visible.sync="addDialogVisible"
      width="50%" @close="addDialogClosed">
      <!-- 内容主体区域 -->
      <el-form :model="addForm" :rules="addFormRules" 
      ref="addFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
        <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
        <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
        <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
        <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户的对话框 -->
    <el-dialog
      title="修改用户"
      :visible.sync="editDialogVisible"
      width="50%" @close="editDialogClosed">
      <!-- 修改信息表格区域 -->
      <el-form ref="editFormRef" :model="editForm" 
      :rules="editFormRules" label-width="70px">
        <el-form-item label="用户名">
        <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
        <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
        <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    //验证邮箱的规则
  var checkEmail = (rule, value, cb) => {
      // 验证邮箱的正则表达式
    const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (regEmail.test(value))
      {
        return cb()
      }
    cb(new Error('请输入合法的邮箱！'))
  }
  // 验证手机号的规则
    var checkMobile = (rule, value, cb) => {
    // 验证手机号的正则表达式
    const regMobile = /^(0|86|17951)?(13[0-9]|15[0123456789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
    if (regMobile.test(value))
      {
        return cb()
      }
    cb(new Error('请输入合法的手机号码！'))
  }
    return {
      // 获取用户列表的参数
      queryInfo: {
        query: '',
        // 当前的页数
        pagenum: 1,
        // 当前每页显示多少条数据
        pagesize: 2
      },
      userlist: [],
      total: 0,
      // 控制对话框的显示与隐藏
      addDialogVisible: false,
      // 控制修改用户对话框的显示与隐藏
      editDialogVisible: false,
      // 添加用户的表单数据
      addForm:{
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 通过id获取的数据存入
      editForm: {},
      // 表单验证规则
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '用户名的长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '密码的长度在 6 到 15 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          {validator: checkEmail, trigger: 'blur'}
        ],
        mobile: [
          { required: true, message: '请输入电话号码', trigger: 'blur' },
          {validator: checkMobile, trigger: 'blur'}
        ],
      },
      editFormRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          {validator: checkEmail, trigger: 'blur'}
        ],
        mobile: [
          { required: true, message: '请输入电话号码', trigger: 'blur' },
          {validator: checkMobile, trigger: 'blur'}
        ],
      }

    }
  },
  created() {
    this.getUserList()
  },
  methods:{
    async getUserList() {
      const { data: res } = await this.$http.get('users', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error('获取用户列表失败！')
      this.userlist = res.data.users
      this.total = res.data.total
      console.log(res)
    },
    handleSizeChange(newSize) {
      // console.log(newSize)
      this.queryInfo.pagesize = newSize
      this.getUserList()
      
    },
    handleCurrentChange(newPage) {
      // console.log(newPage)
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    // 监听switch开关状态的改变
    async userStateChanged(userinfo) {
      console.log(userinfo)
      const {data: res} = await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
      if (res.meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state
        return this.$message.error('更新用户状态失败！') 
      }
      this.$message.success('更新用户状态成功！')

    },
    // 监听添加用户对话的关闭事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    //表单预验证
    addUser() {
      this.$refs.addFormRef.validate( async valid => {
        // console.log(valid)
        // 发起用户的网络请求
        if (!valid) return
        const {data: res} = await this.$http.post('users', this.addForm)
        if(res.meta.status !== 201) 
        {
          return this.$message.error('添加用户失败！')
        }
        this.$message.success('添加用户成功！')
        // 隐藏添加用户对话框
        this.addDialogVisible = false
        // 刷新后重新获取用户列表
        this.getUserList()
      })
    },
    // 展示修改用户信息对话框
    async showEditDialog(id) {
      // console.log(id)
      const {data: res} = await this.$http.get('users/'+ id)
      if(res.meta.status !== 200) 
      {
        return this.$message.error('查询用户信息失败！')
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 修改表单的重置操作
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 修改后提交之前进行表单预验证
    editUserInfo() {
      this.$refs.editFormRef.validate( async valid => {
        if (!valid) return
        // 发起请求
        const { data: res } = await this.$http.put('users/' + this.editForm.id, 
        {email: this.editForm.email, 
        mobile: this.editForm.mobile})
        if (res.meta.status !== 200)
        {
          return this.$message.error('更新用户信息失败')
        }
        // 关闭对话框， 刷新列表，提示修改成功
        this.editDialogVisible = false
        this.getUserList()
        this.$message.success('更新用户信息成功')
      })
    },
    // 根据ID删除对应的用户信息
    async removeUserById(id) {
      // 弹框询问是否删除
      const confirmResult = await this.$confirm
      (
        '此操作将永久删除该用户, 是否继续?', '提示', 
        {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
        }
      ).catch(err=> err)
      // 如果用户取消删除，confirmResult为字符串 'concel'
      if (confirmResult !== 'confirm')
      {
        return this.$message.info('已取消删除')
      }
      // 如果用户确认删除，confirmResult为字符串 'confirm'
      const {data: res} = await this.$http.delete('users/'+ id)
      if (res.meta.status !== 200)
      {
        return this.$message.error('删除用户失败！')
      }
      this.$message.success('删除用户成功！')
      // 刷新用户列表
      this.getUserList()
    }
    }
}
</script>
<style lang="less" scoped>

</style>