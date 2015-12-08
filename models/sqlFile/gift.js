/**
 * Created by admin on 2015/09/09.
 */

var Gift = function () {
};

//得到咖派礼品列表
Gift.getGiftList = function(params){
	return{
		rows:function(){
			var sql =" select g.gift_id as giftId,g.gift_name as giftName,g.bean,";
			sql +="g.picture_path as picturePath,g.create_date as createDate,";
			sql +="g.update_date as updateDate,";
			sql +="(select count(*) from kp_user_gift ug where ug.gift_id = g.gift_id) as humanQi ";
			sql +="from kp_gift g where 1=1 ";
			if(params.startDate !=null && params.endDate !=null){
				sql +=" and g.create_date >= '"+params.startDate+"' and g.create_date <='"+params.endDate+"'";
			};
			if(params.postChoose == 1 && params.keyWord !=null){
				sql +=" and g.gift_name like '%"+params.keyWord+"%'";
			};
			if(params.order == 1){
				sql +=" order by g.create_date desc";
			}else if (params.order ==2){
				sql +=" order by g.create_date asc";
			}else if (params.order ==3){
				sql +=" order by humanQi desc";
			}else if (params.order == 4){
				sql +=" order by humanQi asc";
			}else{
				sql +=" order by g.create_date desc";
			};
			sql += " LIMIT "+params.pageIndex+ " , "+params.pageSize+"";
			return sql;	
		},
		count:function(){
			var sql =" select count(*) as count ";
			sql +="from kp_gift g where 1=1";
			if(params.startDate !=null && params.endDate !=null){
				sql +=" and g.create_date >= '"+params.startDate+"' and g.create_date <='"+params.endDate+"'";
			};
			if(params.postChoose == 1 && params.keyWord !=null){
				sql +=" and g.gift_name like '%"+params.keyWord+"%'";
			};
			return sql;
		}
	};
};
//礼品兑换列表
Gift.getGiftExchangeList = function(params){
	return{
		rows:function(){
			var sql = "select u.user_id as userId,u.nick_name as nickName,u.user_name as userName,g.gift_name as giftName,g.bean as giftBean,";
				sql +="d.name as name,d.details as details,ug.state,ug.express_name as expressName,ug.express_number as expressNumber,";
				sql +="ug.remarks,ug.create_date as createDate,ug.update_date as updateDate,d.province,d.city,d.area,ug.freeze_bean ";
				sql +="as freezeBean,d.address_id as addressId,ug.id,d.phone,u.bean,g.gift_id as giftId,ug.exchange_time as exchangeTime ";
				sql +="from kp_user as u inner join kp_user_gift as ug on u.user_id=ug.user_id inner join kp_gift as g ";
				sql +="on ug.gift_id=g.gift_id left join address d on u.user_id=d.user_id and d.type=1 where u.user_type='user' ";
				
				if(params.startDate !=null && params.endDate !=null){
					sql +=" and ug.create_date >= '"+params.startDate+"' and ug.create_date <= '"+params.endDate+"'";
				}
				if(params.keyWord != null){
					if(params.postChoose ==1){
						sql +=" and u.nick_name like '%"+params.keyWord+"%'";
					}else if (params.postChoose ==2){
						sql +=" and g.gift_name like '%"+params.keyWord+"%'";
					}else if (params.postChoose ==3){
						sql +=" and d.name like '%"+params.keyWord+"%'";
					}else if (params.postChoose ==4){
						sql +=" and d.phone like '%"+params.keyWord+"%'";
					};
				};
				if(params.state !=null && params.state !='' ){
					sql +=" and ug.state = "+params.state;
				};
				if(params.order == 1){
					sql +=" order by ug.create_date desc";
				}else if(params.order ==2){
					sql +=" order by ug.create_date asc";
				}else if(params.order ==3){
					sql+= " order by ifnull(ug.exchange_time,ug.create_date) desc";
				}else if(params.order ==4){
					sql+= " order by ifnull(ug.exchange_time,ug.create_date) asc";
				}else{
					sql +=" order by ug.create_date desc";
				}
				sql += " LIMIT "+params.pageIndex+ " , "+params.pageSize+"";
			return sql;
		},
		count:function(){
			var sql = "select count(*) as count ";
				sql +="from kp_user as u inner join kp_user_gift as ug on u.user_id=ug.user_id inner join kp_gift as g ";
				sql +="on ug.gift_id=g.gift_id left join address d on u.user_id=d.user_id and d.type=1 where u.user_type='user'";
			if(params.startDate !=null && params.endDate !=null){
					sql +=" and ug.create_date >= '"+params.startDate+"' and ug.create_date <= '"+params.endDate+"'";
				}
				if(params.keyWord != null){
					if(params.postChoose ==1){
						sql +=" and u.nick_name like '%"+params.keyWord+"%'";
					}else if (params.postChoose ==2){
						sql +=" and g.gift_name like '%"+params.keyWord+"%'";
					}else if (params.postChoose ==3){
						sql +=" and d.name like '%"+params.keyWord+"%'";
					}else if (params.postChoose ==4){
						sql +=" and d.phone like '%"+params.keyWord+"%'";
					};
				};
				if(params.state !=null && params.state !='' ){
					sql +=" and ug.state = "+params.state;
				};
			return sql;
		}
	};
};	

/**
 * 根据ID获取奖品数
 * @param {Object} params
 */
Gift.getTicketSetById = function(params){
	sql  = " select ";
	sql += " 	id, ticket_id, ticket_name, ticket_count, create_date ";
	sql += " from kp_ticket_set ";
	sql += " 	where ticket_id = " + params.ticketId;
	console.log('SQL = ' + sql);
	return sql;
};

/**
 * 修改奖品数量
 * @param {Object} params
 */
Gift.updateTicketSet = function(params){
	sql = " UPDATE kp_ticket_set";
	sql+= " 	set ticket_count = ticket_count + (" + params.value + ")";
	sql+= " WHERE";
	sql+= " ticket_id = '" + params.ticketId +"'";
	return sql;
};

module.exports = Gift;
