import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { 
  FaCalendarDays, 
  FaClock, 
  FaArrowLeft, 
  FaEye, 
  FaUser, 
  FaNewspaper,
  FaChevronRight,
  FaBookmark,
  FaShareNodes,
  FaFacebook,
  FaTwitter,
  FaLink
} from "react-icons/fa6";

// Static mock news data
const ARTICLES = [
  {
    id: "nike-air-max-2026",
    title: "Nike Air Max 2026: Bước Đột Phá Mới Trong Công Nghệ Đệm Khí",
    category: "technology",
    categoryLabel: "Tin Công Nghệ",
    summary: "Nike vừa chính thức hé lộ thế hệ đệm khí Air Max tiếp theo với cấu trúc lưới 3D cải tiến, mang lại độ êm ái và phản hồi lực vượt trội chưa từng có.",
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200",
    date: "07/07/2026",
    readTime: "5 phút đọc",
    author: "Phan Phát",
    views: "1.2k",
    tag: "NỔI BẬT",
    content: `Thương hiệu thể thao hàng đầu thế giới Nike vừa qua đã chính thức công bố hình ảnh và thông số kỹ thuật của dòng sản phẩm Air Max 2026. Đây được đánh giá là bước nhảy vọt công nghệ lớn nhất của dòng Air Max trong vòng một thập kỷ qua.
    
    Điểm nhấn cốt lõi của Air Max 2026 nằm ở bộ đệm khí thế hệ mới. Thay vì sử dụng các túi khí đúc khuôn thông thường, Nike đã áp dụng công nghệ in 3D sinh học cấu trúc lưới (3D Grid Structure) tích hợp trực tiếp bên trong các túi khí TPU. Cải tiến này giúp phân bổ áp lực bàn chân đều hơn 30% và tăng tỷ lệ phản hồi lực (energy return) lên tới 15% so với thế hệ Air Max tiền nhiệm.
    
    Phần upper của giày được dệt bằng sợi Flyknit làm từ polyester tái chế siêu nhẹ, mang lại khả năng ôm chân tối ưu và độ thoáng khí tuyệt đối. Phối màu ra mắt đầu tiên sẽ là phối màu đỏ/cam hồng đầy năng động kết hợp với các chi tiết màu đen tương phản mạnh mẽ.
    
    Theo công bố từ Nike, sản phẩm sẽ được mở bán giới hạn tại một số cửa hàng Flagship chọn lọc và trên ứng dụng SNKRS từ ngày 15/08/2026 với mức giá bán lẻ đề xuất là $220 USD.`
  },
  {
    id: "sneaker-trend-2026",
    title: "Xu Hướng Sneaker Mùa Hè 2026: Tối Giản Hay Retro Lên Ngôi?",
    category: "trends",
    categoryLabel: "Xu Hướng",
    summary: "Sự trỗi dậy của các dòng giày chạy bộ cổ điển thập niên 90 đang định hình phong cách thời trang đường phố trong mùa hè năm nay.",
    imageUrl: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?q=80&w=800",
    date: "06/07/2026",
    readTime: "4 phút đọc",
    author: "Duy Phong",
    views: "850",
    tag: "XU HƯỚNG",
    content: `Mùa hè năm 2026 chứng kiến một sự dịch chuyển rõ nét trong gu thẩm mỹ của giới trẻ yêu thích thời trang đường phố (streetwear). Cơn sốt của những đôi giày tối giản đang dần nhường chỗ cho trào lưu Retro Runner mang đậm hơi thở thập niên 90 và đầu những năm 2000.
    
    Những thương hiệu như New Balance, Asics và Salomon đang tiếp tục khẳng định thế mạnh với các thiết kế tập trung vào sự thoải mái, tính tiện dụng và các tông màu trung tính pha chút sắc màu vintage (metallic silver, kem nhạt, xanh dương cổ điển).
    
    Bên cạnh đó, xu hướng tối giản không hoàn toàn biến mất mà chuyển dịch sang phong cách "Quiet Luxury" thanh lịch, nơi các đôi giày da lộn cao cấp có tông màu đất, be, xám trở thành mảnh ghép hoàn hảo cho những bộ trang phục lịch lãm thường ngày. Sự đa dạng này đem lại nhiều sự lựa chọn thú vị cho các sneakerhead trong việc định hình phong cách cá nhân.`
  },
  {
    id: "how-to-clean-sneakers",
    title: "Hướng Dẫn Vệ Sinh Giày Sneaker Trắng Đúng Cách Tại Nhà",
    category: "guides",
    categoryLabel: "Mẹo & Hướng Dẫn",
    summary: "Giữ cho đôi giày trắng của bạn luôn như mới với 5 bước vệ sinh đơn giản bằng các nguyên liệu dễ kiếm ngay tại nhà.",
    imageUrl: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=800",
    date: "05/07/2026",
    readTime: "6 phút đọc",
    author: "Solelane Lab",
    views: "2.4k",
    tag: "HỮU ÍCH",
    content: `Giày sneaker trắng luôn là món phụ kiện không thể thiếu trong tủ đồ của bất cứ ai nhờ tính tiện dụng và dễ phối đồ. Tuy nhiên, việc giữ cho chúng luôn sạch bóng lại là một thử thách lớn. 
    
    Dưới đây là quy trình 5 bước đơn giản được các chuyên gia từ Solelane Shoes khuyến nghị để làm sạch giày tại nhà:
    
    Bước 1: Tháo dây và lót giày. Dây giày nên được ngâm riêng trong hỗn hợp nước ấm pha xà phòng loãng.
    Bước 2: Dùng bàn chải lông mềm khô quét sạch lớp bụi bẩn bám trên bề mặt vải và đế giày.
    Bước 3: Pha dung dịch vệ sinh chuyên dụng hoặc hỗn hợp baking soda kết hợp giấm trắng theo tỉ lệ 1:1. Dùng bàn chải mềm nhúng dung dịch và nhẹ nhàng chà sạch các vết bẩn.
    Bước 4: Sử dụng khăn vi sợi (microfiber) ẩm để lau sạch bọt và dung dịch thừa trên giày. Tránh xả trực tiếp nước vào các chất liệu dễ hỏng như da lộn hay nubuck.
    Bước 5: Phơi giày ở nơi khô ráo, thoáng mát và có bóng râm. Tuyệt đối không phơi trực tiếp dưới ánh nắng gay gắt hoặc dùng máy sấy nhiệt độ cao vì sẽ làm biến dạng phom giày và ố vàng lớp keo.`
  },
  {
    id: "adidas-primeknit-future",
    title: "Adidas Ra Mắt Dòng Giày Chạy Làm Từ Rác Thải Đại Dương Cải Tiến",
    category: "technology",
    categoryLabel: "Tin Công Nghệ",
    summary: "Phiên bản Primeknit mới sử dụng 100% sợi dệt tái chế có độ bền tăng gấp đôi, đánh dấu bước tiến lớn trong nỗ lực bảo vệ môi trường.",
    imageUrl: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800",
    date: "03/07/2026",
    readTime: "4 phút đọc",
    author: "Hải Nam",
    views: "940",
    tag: "MÔI TRƯỜNG",
    content: `Adidas vừa tiếp tục củng cố vị thế dẫn đầu trong lĩnh vực phát triển bền vững bằng việc công bố chất liệu dệt Primeknit Ocean thế hệ mới. Toàn bộ phần thân giày được sản xuất từ nhựa đại dương thu gom bởi tổ chức Parley for the Oceans.
    
    Điểm khác biệt của phiên bản năm nay là cấu trúc sợi dệt đa liên kết được gia cố bằng nhiệt, giúp cải thiện độ chịu lực căng và độ bền mài mòn lên gấp đôi so với các phiên bản trước đó. Công nghệ này khắc phục triệt để điểm yếu co giãn quá mức của giày vải dệt sau thời gian dài sử dụng.
    
    Không chỉ bảo vệ môi trường, thiết kế đế đệm Lightboost cải tiến đi kèm còn giúp giảm trọng lượng tổng thể của đôi giày xuống dưới 230g, đem lại trải nghiệm chạy bộ nhẹ nhàng và êm ái lý tưởng cho các vận động viên phong trào.`
  },
  {
    id: "jordan-retro-hype",
    title: "Air Jordan 1 Retro High OG 'Chicago' Rục Rịch Trở Lại Vào Cuối Năm",
    category: "collections",
    categoryLabel: "Bộ Sưu Tập",
    summary: "Các nguồn tin uy tín xác nhận phối màu huyền thoại Chicago sẽ tái xuất với chất liệu da cao cấp được phục dựng nguyên bản 1985.",
    imageUrl: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?q=80&w=800",
    date: "01/07/2026",
    readTime: "3 phút đọc",
    author: "Minh Quân",
    views: "3.1k",
    tag: "HOT",
    content: `Tin vui cực lớn dành cho người hâm mộ thương hiệu Jordan Brand: Phối màu huyền thoại Air Jordan 1 'Chicago' dự kiến sẽ được phát hành lại vào dịp Giáng Sinh năm nay.
    
    Khác với phiên bản "Lost & Found" mang phong cách giả cổ (vintage/cracked leather) ra mắt năm 2022, phiên bản 2026 lần này hướng tới việc tái lập hoàn hảo phom dáng, chất da bóng mịn và các đường chỉ khâu nguyên bản của phối màu ra đời năm 1985. Hộp giày đi kèm cũng được thiết kế theo đúng phong cách đóng gói cổ điển thời kỳ đầu của Michael Jordan.
    
    Sự quay trở lại của phối màu đỏ/trắng/đen mang tính lịch sử này chắc chắn sẽ hâm nóng bầu không khí của thị trường giày thế giới và là mục tiêu săn đón hàng đầu của các nhà sưu tầm trong mùa mua sắm cuối năm.`
  },
  {
    id: "select-size-online",
    title: "Mẹo Đo Size Giày Chuẩn Xác Đến 99% Khi Mua Hàng Online",
    category: "guides",
    categoryLabel: "Mẹo & Hướng Dẫn",
    summary: "Tránh việc đổi trả mất thời gian bằng phương pháp đo kích thước bàn chân cực chuẩn theo chuẩn Nhật Bản và Châu Âu.",
    imageUrl: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?q=80&w=800",
    date: "28/06/2026",
    readTime: "5 phút đọc",
    author: "Solelane Care",
    views: "1.7k",
    tag: "CẨM NANG",
    content: `Mua giày online ngày càng phổ biến nhưng việc chọn nhầm size giày vẫn là nỗi ám ảnh của nhiều người. Mỗi thương hiệu như Nike, Adidas hay Vans lại có một bảng quy chuẩn size (size chart) và phom dáng (fit) khác nhau.
    
    Để tự đo size chân chính xác tại nhà, bạn chỉ cần chuẩn bị một tờ giấy trắng (lớn hơn bàn chân), một chiếc bút chì và một cây thước kẻ:
    
    Bước 1: Đặt tờ giấy sát bức tường phẳng, đặt bàn chân của bạn lên tờ giấy sao cho gót chân chạm nhẹ vào tường.
    Bước 2: Dùng bút chì dựng thẳng đứng vẽ lại đường viền mũi chân của bạn (chấm điểm dài nhất ở ngón chân cái hoặc ngón trỏ).
    Bước 3: Dùng thước kẻ đo khoảng cách từ mép giấy (gót chân) đến điểm xa nhất của mũi chân vừa chấm. Đây chính là chiều dài bàn chân của bạn (tính bằng cm).
    Bước 4: Đối chiếu số đo cm này với bảng size chart của hãng giày bạn muốn mua. Lưu ý nếu chân bạn bè ngang dày hoặc mu bàn chân cao, hãy cân nhắc tăng thêm 0.5 size (up size) để có cảm giác đi thoải mái nhất.`
  },
  {
    id: "hypebeast-sneakers-value",
    title: "Tại Sao Sneaker Trở Thành Kênh Đầu Tư Sinh Lời Hơn Cả Vàng?",
    category: "trends",
    categoryLabel: "Xu Hướng",
    summary: "Phân tích thị trường resell sneaker năm qua và lý do những đôi giày giới hạn tiếp tục tăng giá phi mã bất chấp biến động kinh tế.",
    imageUrl: "https://images.unsplash.com/photo-1575537302964-96cd47c06b1b?q=80&w=800",
    date: "25/06/2026",
    readTime: "7 phút đọc",
    author: "Khánh Linh",
    views: "4.2k",
    tag: "PHÂN TÍCH",
    content: `Thị trường mua đi bán lại (resell) giày thể thao toàn cầu đã phát triển từ một sở thích sưu tầm thuần túy thành một ngành công nghiệp tỷ đô đầy chuyên nghiệp. Những đôi giày collab số lượng giới hạn của Nike, Adidas kết hợp cùng các nghệ sĩ hay nhà mốt xa xỉ thường ghi nhận mức tăng giá trị từ 200% đến thậm chí 1000% ngay sau khi mở bán.
    
    Sự khan hiếm nhân tạo kết hợp với hiệu ứng tâm lý FOMO (sợ bỏ lỡ cơ hội) của thế hệ trẻ đã đẩy giá trị của những phiên bản đặc biệt lên cao. Khác với các kênh đầu tư truyền thống, sneaker mang giá trị văn hóa và tính biểu tượng xã hội cao, thu hút nguồn vốn khổng lồ từ các quỹ đầu tư chuyên nghiệp và những nhà sưu tầm giàu có.
    
    Tuy nhiên, các chuyên gia tài chính cũng cảnh báo đây là thị trường có độ biến động cao và tính thanh khoản phụ thuộc lớn vào xu hướng cộng đồng, do đó nhà đầu tư cần trang bị kiến thức sâu rộng trước khi tham gia giao dịch.`
  }
];

export async function generateMetadata({
  params
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const article = ARTICLES.find(a => a.id === id);

  if (!article) {
    return { title: "Bài viết không tồn tại" };
  }

  return {
    title: `${article.title} | myshoes.vn`,
    description: article.summary
  };
}

export default async function ArticleDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = ARTICLES.find(a => a.id === id);

  if (!article) {
    notFound();
  }

  // Get other articles for recommendation
  const otherArticles = ARTICLES.filter(a => a.id !== id).slice(0, 3);

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-800 pb-16">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-100">
        <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 lg:px-8">
          <nav className="flex flex-wrap items-center gap-2 text-sm text-slate-500 font-semibold">
            <Link href="/" className="hover:text-[#0d3a6b] transition-colors">Trang chủ</Link>
            <FaChevronRight className="text-[10px]" />
            <Link href="/news" className="hover:text-[#0d3a6b] transition-colors">Tin tức</Link>
            <FaChevronRight className="text-[10px]" />
            <span className="text-slate-900 font-bold truncate max-w-[200px] sm:max-w-md">{article.title}</span>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 pt-8 sm:px-6 lg:px-8">
        {/* Back link */}
        <Link 
          href="/news" 
          className="inline-flex items-center gap-2 text-sm font-bold text-[#0d3a6b] hover:text-[#0a2747] transition-colors mb-6 group"
        >
          <FaArrowLeft className="text-xs transition-transform group-hover:-translate-x-1" />
          <span>Quay lại trang tin tức</span>
        </Link>

        <div className="grid gap-10 lg:grid-cols-[7.2fr_2.8fr] items-start">
          {/* Main Article Content */}
          <article className="rounded-3xl bg-white border border-slate-100 p-6 sm:p-10 shadow-sm">
            <div className="space-y-4">
              {/* Category & meta */}
              <div className="flex flex-wrap items-center gap-3.5 text-xs font-bold text-slate-400">
                <span className="rounded-full bg-[#0d3a6b]/10 px-3.5 py-1 text-[#0d3a6b] font-bold uppercase tracking-wider">
                  {article.categoryLabel}
                </span>
                <span className="flex items-center gap-1.5">
                  <FaCalendarDays />
                  {article.date}
                </span>
                <span className="flex items-center gap-1.5">
                  <FaClock />
                  {article.readTime}
                </span>
                <span className="flex items-center gap-1.5">
                  <FaEye />
                  {article.views} lượt xem
                </span>
              </div>

              {/* Title */}
              <h1 className="text-xl font-bold text-slate-900 leading-snug sm:text-2xl lg:text-3xl">
                {article.title}
              </h1>

              {/* Summary / Lead Paragraph */}
              <p className="text-base font-bold text-slate-600 leading-relaxed border-l-4 border-[#0d3a6b] pl-4 italic bg-slate-50/50 py-2 pr-2 rounded-r-xl">
                {article.summary}
              </p>

              {/* Banner Image */}
              <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-slate-100 shadow-sm my-8">
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Article Body */}
              <div className="text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-line font-medium space-y-6 pt-4">
                {article.content}
              </div>

              {/* Share & Save */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-8 mt-10">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0d3a6b]/5 text-[#0d3a6b] font-bold text-sm uppercase">
                    {article.author.slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Viết bởi {article.author}</p>
                    <p className="text-xs text-slate-400 font-semibold">Tác giả biên tập</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mr-2">Chia sẻ:</span>
                  <button className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-50 text-slate-600 transition-colors hover:bg-[#0d3a6b] hover:text-white" aria-label="Share on Facebook">
                    <FaFacebook className="text-sm" />
                  </button>
                  <button className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-50 text-slate-600 transition-colors hover:bg-[#0d3a6b] hover:text-white" aria-label="Share on Twitter">
                    <FaTwitter className="text-sm" />
                  </button>
                  <button className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-50 text-slate-600 transition-colors hover:bg-[#0d3a6b] hover:text-white" aria-label="Copy Link">
                    <FaLink className="text-sm" />
                  </button>
                </div>
              </div>
            </div>
          </article>

          {/* Sidebar / Recommendations */}
          <aside className="space-y-8 lg:sticky lg:top-24">
            {/* Box other news */}
            <div className="rounded-3xl bg-white border border-slate-100 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
                <FaNewspaper className="text-slate-400 text-sm" />
                <span>Bài viết khác</span>
              </h3>
              
              <div className="mt-5 space-y-5">
                {otherArticles.map((other) => (
                  <Link 
                    key={other.id} 
                    href={`/news/${other.id}`}
                    className="group block space-y-1.5"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-slate-50">
                      <img
                        src={other.imageUrl}
                        alt={other.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-wider text-[#0d3a6b]">
                        {other.categoryLabel}
                      </p>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-[#0d3a6b] transition-colors">
                        {other.title}
                      </h4>
                      <p className="text-[10px] font-semibold text-slate-400">
                        {other.date}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Banner Ad placeholder */}
            <div className="rounded-3xl bg-gradient-to-br from-[#0d3a6b] to-[#0a2747] p-6 text-white text-center shadow-sm relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-white/5"></div>
              <h3 className="text-base font-black uppercase tracking-wider">Độc Quyền Tại Solelane</h3>
              <p className="mt-2 text-xs text-white/80 font-medium leading-relaxed">
                Nhập mã <span className="font-bold text-yellow-300">SOLE2026</span> giảm ngay 10% cho đơn hàng đầu tiên của bạn!
              </p>
              <Link 
                href="/products" 
                className="mt-4 inline-block w-full rounded-xl bg-white py-2 text-xs font-black uppercase tracking-widest text-[#0d3a6b] shadow-md hover:bg-slate-50 transition-colors"
              >
                Mua sắm ngay
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
