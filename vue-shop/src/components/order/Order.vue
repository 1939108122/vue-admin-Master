<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <el-col :span="8">
         <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getOrderList">
              <el-button slot="append" icon="el-icon-search" @click="getOrderList"></el-button>
            </el-input>
        </el-col>
      </el-row>
      <!-- 订单表格 -->
      <el-table :data="orderlist" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column label="订单价格" prop="order_price"></el-table-column>
        <el-table-column label="是否付款" prop="pay_status">
          <template slot-scope="scope">
            <el-tag type="danger" v-if="scope.row.pay_status === '1'">未付款</el-tag>
            <el-tag type="success" v-else>已付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send"></el-table-column>
        <el-table-column label="下单时间" prop="create_time">
          <template slot-scope="scope">
            {{ scope.row.create_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template>
            <el-button icon="el-icon-edit" size="mini" type="primary" @click="showBox"></el-button>
            <el-button icon="el-icon-location" size="mini" type="success" @click="showProgressBox"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>
    <!-- 修改地址的对话框 -->
      <el-dialog
      title="修改地址"
      :visible.sync="showBoxVisible"
      width="50%" @close="addressDialogClosed">
      <!-- 编辑表单 -->
      <el-form :model="addressForm" :rules="addressFormRule" ref="addressFormRef" label-width="100px">
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader :options="cityData" v-model="addressForm.address1"></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showBoxVisible = false">取 消</el-button>
        <el-button type="primary" @click="showBoxVisible = false">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 展示物流进度的对话框 -->
    <el-dialog
      title="物流进度"
      :visible.sync="progressVisible"
      width="50%">
      <!-- 时间线 -->
        <el-timeline>
          <el-timeline-item
            v-for="(activity, index) in progressInfo"
            :key="index"
            :timestamp="activity.time">
            {{ activity.context }}
          </el-timeline-item>
        </el-timeline>
    </el-dialog>
  </div>
</template>
<script>
import cityData from './citydata.js'
export default {
  data() {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10,

      },
      // 订单数组
      orderlist: [],
      // 订单总数
      total: 0,
      // 控制修改对话框的显示与隐藏的变量
      showBoxVisible: false,
      // 双向绑定表单数据
      addressForm: {
        address1: [],
        address2: ''
      },
      // 验证表单规则对象
      addressFormRule: {
        address1: [
          { required: true, message: '请选择省市区/县', trigger: 'blur' }
        ],
        address2: [
          { required: true, message: '请填写详细的地址', trigger: 'blur' }
        ],
      },
      // 地址数据
      cityData,
      // 控制物流进度对话框的显示与隐藏的变量
      progressVisible: false,
      progressInfo: []
    }
  },
  created() {
    this.getOrderList()
  },
  methods: {
    // 获取所有订单
     async getOrderList() {
      const {data: res} = await this.$http.get('orders', {params: this.queryInfo})
      if (res.meta.status !== 200) 
      {
        return this.$message.error('获取订单列表失败！')
      }
      // 将获取数据赋值给orderlist
      this.orderlist = res.data.goods
      console.log(this.orderlist)
      console.log(this.queryInfo.query)
      // 赋值商品总条数
      this.total = res.data.total
    },
      handleSizeChange(newSize)
    {
      this.queryInfo.pagesize = newSize
      this.getOrderList()
    },
    handleCurrentChange(newPage) 
    {
      this.queryInfo.pagenum = newPage
      this.getOrderList()
    },
    // 展示地址修改对话框
    showBox() {
      this.showBoxVisible = true
    },
    // 监听对话框的关闭事件
    addressDialogClosed() {
      this.$refs.addressFormRef.resetFields()
    },
    async showProgressBox() {
      const {data:res} = await this.$http.get('/kuaidi/804909574412544580')
      if (res.meta.status !== 200)
      {
        return this.$message.error('获取物流进度失败！')
      }
      console.log(res.data)
      this.progressInfo = res.data
      this.progressVisible = true
    }
  }
}
</script>
<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
</style>