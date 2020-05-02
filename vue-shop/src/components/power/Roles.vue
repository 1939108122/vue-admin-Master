<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-row>
        <el-col><el-button type="primary" @click="addRoleDialog">添加角色</el-button></el-col>
      </el-row>
      <el-table :data="roleList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row :class="['bd-bottom',i1===0? 'bd-top':'','vcenter']" 
            v-for="(item1, i1) in scope.row.children" :key="item1.id">
            <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable 
                @close="removeRightById(scope.row, item1.id)"
                >{{ item1.authName }}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级三级权限 -->
              <el-col :span="19">
                <el-row :class="[i2 === 0? '':'bd-top','vcenter']"
                v-for="(item2,i2) in item1.children" :key="item2.id">
                  <el-col :span="6">
                    <el-tag type="success" closable 
                    @close="removeRightById(scope.row, item2.id)"
                    >{{ item2.authName }}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag v-for="item3 in item2.children" :key="item3.id" 
                    type="warning" closable 
                    @close="removeRightById(scope.row, item3.id)">
                      {{ item3.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
            <pre>
              {{ scope.row }}
            </pre>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeRoleById(scope.row.id)">删除</el-button>
            <el-button type="warning" icon="el-icon-setting" 
            size="mini" @click="showSetRightDialog(scope.row)">分配权限
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 分配权限的对话框 -->
    <el-dialog
      title="分配权限" :visible.sync="setRightDialogVisible" 
      width="50%" @close="setDefKeysNull">
      <!-- 树形控件 -->
      <el-tree ref="treeRef" :data="rightList" :props="treeProps"
      show-checkbox node-key="id" default-expand-all
      :default-checked-keys="defKeys"></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" 
        @click="allotRights">
          确 定
        </el-button>
      </span>
    </el-dialog>
    <!-- 添加角色的对话框 -->
    <el-dialog
      title="添加角色"
      :visible.sync="addRoleDialogVisible"
      width="50%" @click="addRoleDialog" @close="addRoleDialogClosed">
      <!-- 内容主体区域 -->
      <el-form ref="addRoleformRef" :model="addRole" 
      label-width="80px" :rules="addRoleFormRules">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRole.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRole.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRoleValid">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改角色的对话框 -->
     <el-dialog
      title="修改角色"
      :visible.sync="editDialogVisible"
      width="50%" @close="editDialogClosed">
      <!-- 修改信息表格区域 -->
      <el-form ref="editFormRef" :model="editForm" 
      :rules="editFormRules" label-width="70px">
        <el-form-item label="角色名称">
        <el-input v-model="editForm.roleName" disabled></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
        <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRolesInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      // 所有角色列表
      roleList: [],
      // 控制权限分配的对话框变量
      setRightDialogVisible: false,
      // 权限分配的列表
      rightList: [],
      // 树形控件的绑定对象
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 默认选中的节点ID值数组
      defKeys: [],
      roleId: [],
      // 控制添加角色对话框的显示与隐藏
      addRoleDialogVisible:false,
      // 添加角色的表单数据
      addRole: {
        roleName:'',
        roleDesc:''
      },
      // 添加角色对话框的表单验证
      addRoleFormRules:{
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' }
        ]
      },
      // 控制修改对话框的显示与隐藏
      editDialogVisible: false,
      // 编辑
      editForm: {},
      // 修改角色表单验证规则
      editFormRules: {
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
        ]
      }
    }
  },
  created() {
  this.getRoleList()
  },
  methods: {
    // 获取所有角色列表
    async getRoleList() {
      const {data: res} = await this.$http.get('roles')
      if (res.meta.status !== 200)
      {
        return this.$message.error('获取角色列表失败！')
      }
      this.roleList = res.data
      console.log(this.roleList)
    },
    // 根据id删除权限
    async removeRightById(role,rightId) {
      // 弹框提示是否删除
      const confirmRes = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err=>{console.log(err)})
      if (confirmRes !== 'confirm') return this.$message.info('取消了删除')

      const {data: res} = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)

      if (res.meta.status !== 200) return this.$message.error('删除权限失败！')

      // this.getRoleList() 不建议这样要不然会删除后渲染页面箭头会关闭
      // console.log(role)
      role.children = res.data
      
    },
    // 展示分配权限的对话框
    async showSetRightDialog(roles) {
      this.roleId = roles.id
      // 获取权限列表
      const {data: res} = await this.$http.get('rights/tree')
      if (res.meta.status !== 200)
      {
        return this.$message.error('获取角色列表失败')
      }
      // 获取的数据爆保存到数组中
      this.rightList = res.data
      // console.log(res)
      // 调用递归函数获取id
      this.getLeafKeys(roles, this.defKeys)
      // console.log(this.defKeys)
      this.setRightDialogVisible = true
    },
    // 通过递归的方式把三级权限的保存到数组中
    getLeafKeys(node, arr) {
      if (!node.children)
      {
        return arr.push(node.id)
      }
      node.children.forEach(item=> {
        this.getLeafKeys(item, arr)
      })
    },
    // 关闭对话框时清空权限数组
    setDefKeysNull() {
      this.defKeys = []
    },
    // 点击确定分配权限
    async allotRights() {
      const keys=[
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      // console.log(keys)
      const idStr = keys.join(',')
      const {data:res} = await this.$http.post(`roles/${this.roleId}
      /rights`, {rids: idStr})
      if (res.meta.status !== 200)
      {
        return this.$message.error('分配角色失败！')
      }
      this.$message.success('分配权限成功!')
      this.getRoleList()
      this.setRightDialogVisible = false
    },
    // 点击添加角色弹出对话框
    addRoleDialog() {
      this.addRoleDialogVisible = true
    },
    // 实现表单预验证及提交数据
    addRoleValid() {
      this.$refs.addRoleformRef.validate(async valid => {
        if (!valid) return
        const {data: res} = await this.$http.post('roles', this.addRole)
        if(res.meta.status !== 201)
        {
          return this.$message.error('添加角色失败！')
        }
        this.$message.success('添加角色成功！')
        // 隐藏添加用户对话框
        this.addRoleDialogVisible = false
        // 刷新列表
        this.getRoleList()
      })
    },
    // 监听添加角色对话框的关闭事件
    addRoleDialogClosed() {
      this.$refs.addRoleformRef.resetFields()
    },
    // 监听编辑角色的事件
    async showEditDialog(id) {
      // console.log(id)
      const {data: res} = await this.$http.get('roles/'+ id)
      if(res.meta.status !== 200) 
      {
        return this.$message.error('查询角色信息失败！')
      }
      this.editForm = res.data
      console.log(this.editForm)
      this.editDialogVisible = true
    },
    // 修改表单的重置操作
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
     // 修改后提交之前进行表单预验证
    editRolesInfo() {
      this.$refs.editFormRef.validate( async valid => {
        if (!valid) return
        // 发起请求
        const { data: res } = await this.$http.put('roles/' + this.editForm.roleId, 
        {roleName: this.editForm.roleName, 
        roleDesc: this.editForm.roleDesc})
        if (res.meta.status !== 200)
        {
          return this.$message.error('更新角色信息失败')
        }
        // 关闭对话框， 刷新列表，提示修改成功
        this.editDialogVisible = false
        this.getRoleList()
        this.$message.success('更新角色信息成功')
      })
    },
    // 根据ID删除对应的角色信息
    async removeRoleById(id) {
      // 弹框询问是否删除
      const confirmResult = await this.$confirm
      (
        '此操作将永久删除该角色, 是否继续?', '提示', 
        {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
        }
      ).catch(err=> err)
      // 如果角色取消删除，confirmResult为字符串 'concel'
      if (confirmResult !== 'confirm')
      {
        return this.$message.info('已取消删除')
      }
      // 如果角色确认删除，confirmResult为字符串 'confirm'
      const {data: res} = await this.$http.delete('roles/'+ id)
      if (res.meta.status !== 200)
      {
        return this.$message.error('删除用户失败！')
      }
      this.$message.success('删除用户成功！')
      // 刷新角色列表
      this.getRoleList()
    },
  }
}
</script>
<style lang="less" scoped>
  .el-tag {
    margin: 7px;
  }
  .bd-top {
    border-top: 1px solid #eee;
  }
  .bd-bottom {
    border-bottom: 1px solid #eee;
  }
  .vcenter {
    display: flex;
    align-items: center;
  }
</style>