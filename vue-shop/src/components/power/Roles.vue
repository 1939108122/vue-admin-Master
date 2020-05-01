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
        <el-col><el-button type="primary">添加角色</el-button></el-col>
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
            <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
            <el-button type="warning" icon="el-icon-setting" 
            size="mini" @click="showSetRightDialog(scope.row)">分配权限
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
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
      roleId: []
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
    }
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