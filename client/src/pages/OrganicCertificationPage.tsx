import React from 'react';

const OrganicCertificationPage: React.FC = () => {
    const benefits = [
        {
            title: 'Tín nhiệm từ người tiêu dùng',
            content: 'Minh bạch nguồn gốc giúp tạo ra sự tin tưởng, người mua hiểu rõ quy trình sản xuất nên yên tâm lựa chọn.'
        },
        {
            title: 'Bảo vệ sức khỏe',
            content: 'Đảm bảo sản phẩm không chứa hoá chất độc hại, phân bón hóa học hay phụ gia gây ảnh hưởng tới sức khoẻ.'
        },
        {
            title: 'Bảo vệ môi trường',
            content: 'Áp dụng phương pháp canh tác bền vững, bảo vệ đa dạng sinh học và giảm tác động tiêu cực.'
        },
        {
            title: 'Chống gian lận',
            content: 'Nguồn gốc rõ ràng ngăn chặn hành vi gian lận, giúp người tiêu dùng mua đúng sản phẩm chất lượng.'
        },
        {
            title: 'Thúc đẩy nông nghiệp bền vững',
            content: 'Khuyến khích doanh nghiệp đầu tư vào chuỗi cung ứng sạch, an toàn cho cả môi trường và con người.'
        },
    ];

    const criteria = [
        'Không sử dụng hóa chất độc hại: phân bón hóa học, thuốc trừ sâu, thuốc diệt cỏ hay phụ gia tổng hợp.',
        'Quản lý vùng canh tác: bảo vệ đất đai, nguồn nước và đa dạng sinh học.',
        'Quản lý môi trường: ưu tiên phương pháp tự nhiên để xử lý cỏ dại, sâu bệnh.',
        'Quản lý vật nuôi: thức ăn hữu cơ, không hormone tăng trưởng hoặc kháng sinh.',
    ];

    return (
        <div className="bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="bg-white rounded-2xl shadow-sm p-6 md:p-10">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-snug">
                        Minh bạch nguồn gốc chứng nhận hữu cơ quan trọng như thế nào? Organicfood.vn sở hữu 2 chứng nhận hữu cơ quốc tế uy tín USDA/EU Organic
                    </h1>

                    <div className="mt-6 space-y-6 text-gray-700 leading-relaxed">
                        <p>Organic được chứng nhận hữu cơ bởi tổ chức quốc tế Control Union (registration code CU 900475-PRC 156299). Chúng tôi tin rằng minh bạch nguồn gốc là nền tảng để xây dựng lòng tin từ người tiêu dùng.</p>

                        <img
                            src="https://lh7-us.googleusercontent.com/_2t0T33gZe8Bvohpfb6YrvgFzTdS43ZWWUCfynCy5Sv1uqJbJgz4gt72IUUcrElpdOWQowG_4BmtHGbtV_B3Ngj0ezyMzOMjN-4whHIAkDGTYcAZBFikazLPtvVYBYJqwLwp-bVEfQwprKWblc1sKoM"
                            alt="Tem rau củ đã được kiểm duyệt"
                            className="max-w-3xl mx-auto rounded-lg "
                        />
                        <p className="text-center text-sm text-gray-500 mt-3 italic">Tem rau củ đã được kiểm duyệt đầy đủ thông tin.</p>

                        <div className="grid md:grid-cols-2 gap-5 pt-4">
                            {benefits.map(benefit => (
                                <div key={benefit.title} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                                    <h3 className="font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                                    <p className="text-sm text-gray-600">{benefit.content}</p>
                                </div>
                            ))}
                        </div>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">1. Chứng nhận hữu cơ EU và USDA là gì?</h2>
                            <p>Organicfood.vn đang sở hữu đồng thời hai chứng nhận phổ biến nhất tại Việt Nam: EU Organic và USDA Organic, đảm bảo quy trình sản xuất – chế biến tuân thủ nghiêm ngặt.</p>

                            <div className="grid md:grid-cols-2 gap-6 mt-4">
                                <figure className=" rounded-xl p-4  ">
                                    <img
                                        src="https://lh7-us.googleusercontent.com/TW9UhIG53uQTx197-34l5asBxGSUFInEYtgj4M0u-gbAwfxkFNV_z9xD2Yl06_314-53OTeD1vejY70-LSweUYY6Qr1TbE1yHwb7t3fFDe20Y2pj19olv7B78Lt7TE4LGovXolEefh7LfA8xX_euDLg"
                                        alt="Chứng nhận hữu cơ EU"
                                        className="rounded-lg w-full object-contain"
                                    />
                                    <figcaption className="mt-2 text-center text-sm text-gray-500 italic">
                                        Chứng nhận hữu cơ EU cấp bởi Control Union.
                                    </figcaption>
                                </figure>
                                <figure className=" rounded-xl p-4 ">
                                    <img
                                        src="https://lh7-us.googleusercontent.com/eeB_qgjX-6Y94bdDuNQgS2K6GyTmAN1gzds42HJaOixYj6z2t-n_OV31UNIg9ex7KDRDI7R1GA9HB10P5KVw37m9N4jMb6w0UtIcieEarLPJuScqE1bm91-9wtYA_RO5jqshge3_zZHJHUMSlBQK3MY"
                                        alt="Chứng nhận hữu cơ USDA"
                                        className="rounded-lg w-full object-contain"
                                    />
                                    <figcaption className="mt-2 text-center text-sm text-gray-500 italic">
                                        Chứng nhận hữu cơ USDA được cấp bởi Control Union.
                                    </figcaption>
                                </figure>
                            </div>

                            <div className="mt-4 space-y-3">
                                <p><strong>Chứng nhận hữu cơ EU:</strong> do các tổ chức được Liên minh châu Âu công nhận đánh giá. Tiêu chuẩn bao phủ quản lý ruộng đất, vật nuôi và chế biến.</p>
                                <p><strong>Chứng nhận hữu cơ USDA:</strong> do Bộ Nông nghiệp Hoa Kỳ quản lý, đảm bảo sản phẩm tuân thủ hệ thống hữu cơ quốc gia.</p>
                            </div>
                        </section>

                        <section className="mt-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">2. Control Union là ai?</h2>
                            <p>Control Union là tổ chức chứng nhận quốc tế có trụ sở tại Hà Lan, chuyên đánh giá các tiêu chuẩn nông nghiệp bền vững, hữu cơ, an toàn thực phẩm và quản lý chuỗi cung ứng. Với mạng lưới toàn cầu, đơn vị này cung cấp chứng nhận EU Organic và USDA Organic cho doanh nghiệp, đảm bảo uy tín và tính minh bạch khi đưa sản phẩm ra thị trường.</p>
                            <img
                                src="https://lh7-us.googleusercontent.com/ekdkD77CE-h2FVGmhHSRbiJoAwRn6GIr8ELp16SFX2k9Bcn37mMXZBQXWQ7gjdtD3sj2Zvpm-Zmzmrj6Q7Y0peecEbHxTb3ZK2Wu6b2pQpo5NJTPMQx2XLr6_0ykl7_i9Na-OOg7lR5zDHGfnVwj1AE"
                                alt="Control Union Vietnam"
                                className="max-w-3xl mx-auto rounded-lg shadow-sm mt-4"
                            />
                            <p className="text-center text-sm text-gray-500 mt-3 italic">
                                Trụ sở Control Union tại Việt Nam – 182-184 Bùi Tá Hán, Quận 2, TP.HCM.
                            </p>
                        </section>

                        <section className="mt-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">3. Tiêu chuẩn đánh giá nghiêm ngặt ra sao?</h2>
                            <h3 className="font-semibold text-gray-900 mb-3">Các tiêu chí cơ bản</h3>
                            <ul className="list-disc list-inside space-y-2 text-gray-700">
                                {criteria.map(item => (
                                    <li key={item}>{item}</li>
                                ))}
                            </ul>

                            <div className="grid md:grid-cols-2 gap-6 mt-6">
                                <div className="bg-gray-50 border border-gray-100 rounded-xl p-5">
                                    <h3 className="font-semibold text-lg text-gray-900 mb-3">USDA Organic</h3>
                                    <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm">
                                        <li>Kiểm tra định kỳ bởi tổ chức được USDA công nhận.</li>
                                        <li>Sản phẩm phải chứng minh tuân thủ toàn bộ yêu cầu quốc gia về hữu cơ.</li>
                                        <li>Ghi nhãn “USDA Organic” khi đạt chuẩn.</li>
                                    </ul>
                                </div>
                                <div className="bg-gray-50 border border-gray-100 rounded-xl p-5">
                                    <h3 className="font-semibold text-lg text-gray-900 mb-3">EU Organic</h3>
                                    <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm">
                                        <li>Được kiểm tra bởi tổ chức do Liên minh châu Âu phê duyệt.</li>
                                        <li>Sản phẩm phải đáp ứng yêu cầu về sản xuất và ghi nhãn.</li>
                                        <li>Có thể dùng cho xuất khẩu khi đáp ứng thêm yêu cầu quốc gia đích.</li>
                                    </ul>
                                </div>
                            </div>

                            <p className="mt-6">Việc tuân thủ các bộ tiêu chuẩn quốc tế giúp Organic cam kết mang đến nguồn nông sản hữu cơ minh bạch, an toàn và bền vững.</p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrganicCertificationPage;

