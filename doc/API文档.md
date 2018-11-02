# API文档


### 订单管理
<table>
	<tr>
		<th>API列表</th>
		<th>描述</th>
		<th>更新时间</th>
	</tr>
	<tr>
		<td>GET /orders/{id}</td>
		<td>获取订单详情</td>
		<td>2018-11-11</td>
	</tr>
	<tr>
		<td>POST /orders/deliver</td>
		<td>订单发货</td>
		<td>2018-11-11</td>
	</tr>
	<tr>
		<td>POST /orders/sign</td>
		<td>订单签收</td>
		<td>2018-11-11</td>
	</tr>
	<tr>
		<td>POST /orders/cancel</td>
		<td>取消订单</td>
		<td>2018-11-11</td>
	</tr>
	<tr>
		<td>PUT /order/express/modify</td>
		<td>修改物流信息</td>
		<td>2018-11-11</td>
	</tr>
</table>

### 退款退货
<table>
	<tr>
		<th>API列表</th>
		<th>描述</th>
		<th>更新时间</th>
	</tr>
	<tr>
		<td>POST /refund_orders</td>
		<td>创建退款/退货信息</td>
		<td>2018-11-11</td>
	</tr>
</table>

### 商品
<table>
	<tr>
		<th>API列表</th>
		<th>描述</th>
		<th>更新时间</th>
	</tr>
	<tr>
		<td>POST /items</td>
		<td>创建商品</td>
		<td>2018-11-11</td>
	</tr>
</table>